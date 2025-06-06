import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";


document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('ez-button').addEventListener('click', () => run(true));
	document.getElementById('clear-button').addEventListener('click', () => clear());
	document.getElementById('run-button').addEventListener('click', () => run());
	document.getElementById('formulaInput').addEventListener('keydown', event => {
		if (event.key === 'Enter') {
			event.preventDefault();
			run(true); //ez mode
		}
	});

	// Listen for window resize to update dimensions
	window.addEventListener('resize', run);
});

let maxLabel = 150;
let duration = 500;
let radius = 5;
let i = 0;
let root;
let columnAttribute = [];
let svg, tree, diagonal;
let currentTableau = null;
const logger = new Logger();
let container = document.getElementById('tree-container');
let width = container.clientWidth - 40; 
let height = container.clientHeight - 100; 

function run(ezmode=false) {
	logger.clearLogs();
	const formula = document.getElementById('formulaInput').value;
	const f = new MPL.Wff(formula)
	const tableau = new Tableau(formula);
	logger.addLog("Creating tableau in EZMODE for formula: " + f.unicode())
	if (ezmode){
		tableau.runTableau(logger);
	}
	const treeData = tableau.toD3();
	currentTableau = tableau;

	columnAttribute = [];
	i = 0;

	d3.select("#tree-container").selectAll("*").remove();

	// Set up SVG with dynamic width and height based on the container size
	svg = d3.select("#tree-container").append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", `translate(0, ${maxLabel})`);

	// Set up tree layout
	tree = d3.tree().size([width, height - maxLabel * 2]);
	diagonal = d3.linkVertical()
		.x(d => d.x)
		.y(d => d.y);

	root = d3.hierarchy(treeData, (d) => d.children);
	root.each(function(d) {
		d.id = d.data.id || d.id;  // Ensure IDs are not overwritten
	});
	root.x0 = width / 2;
	root.y0 = 0;

	displayLogsInHTML(logger);
	update(root);

}

function update(source) {
	displayLogsInHTML(logger);

	// Get the container element again in case it was resized
	container = document.getElementById('tree-container');
	width = container.clientWidth - 40; // Adjust for padding/margin
	height = container.clientHeight - 100; // Adjust for padding/margin

	// Set the size of the tree layout based on the container size
	const treeData = tree(root);
	const nodes = treeData.descendants();
	const links = treeData.links();
	const leafs = currentTableau.getLeafs();

	let visibleDepth = getVisibleDepth(root);
	height = (visibleDepth + 2) * maxLabel;  // Adjust height based on visible depth
	tree.size([width, height - maxLabel * 2]);

	// Update SVG height dynamically based on the new tree size
	d3.select("svg").transition().duration(duration).attr("height", height);

	nodes.forEach(d => d.y = d.depth * maxLabel);

	const node = svg.selectAll("g.node")
		.data(nodes, d => d.id || (d.id = ++i));

	const nodeEnter = node.enter().append("g")
		.attr("class", "node")
		.attr("transform", d => `translate(${source.x0},${source.y0})`)
		.on("click", rclick)
		.on("contextmenu", click)
		.on("dblclick", dblClick);

	nodeEnter.append("circle")
		.attr("r", 0)

	nodeEnter.append("text")
		.attr("x", d => {
			const spacing = computeRadius(d.data) + 5;
			return d.children || d._children ? -spacing : spacing;
		})
		.attr("dy", "3")
		.attr("text-anchor", d => d.children || d._children ? "end" : "start")
		// .text(d => `(${d.id}) ${d.data.label}: ${d.data.value.unicode()}`) // PARA DEBUG CON LABELS
		.text(d => {
			// console.log(d.data.origin)
			let origin = ''
			if (!d.data.origin){
				origin = 'root' 
			}else{
				origin = d.data.origin.id
			}
			return `(${d.id}) = ${origin} = ${d.data.label}: ${d.data.value.unicode()}`
		})
		.style("fill-opacity", 0);

	const nodeUpdate = node.merge(nodeEnter).transition()
		.duration(duration)
		.attr("transform", d => `translate(${d.x},${d.y})`);


	let leafsId = leafs.map(x => x.id)
	nodeUpdate.select("circle")
		.attr("r", d => computeRadius(d.data))
		.attr("class", d => (currentTableau.isAvailable(d.id) || leafsId.includes(Number(d.id)))? "clickable" : "non-clickable");

	nodeUpdate.select("text").style("fill-opacity", 1);

	const nodeExit = node.exit().transition()
		.duration(duration)
		.attr("transform", d => `translate(${source.x},${source.y})`)
		.remove();

	nodeExit.select("circle").attr("r", 0);
	nodeExit.select("text").style("fill-opacity", 0);

	const link = svg.selectAll("path.link")
		.data(links, d => d.target.id);

	link.enter().insert("path", "g")
		.attr("class", "link")
		.attr("d", d => {
			const o = { x: source.x0, y: source.y0 };
			return diagonal({ source: o, target: o });
		})
		.merge(link)
		.transition().duration(duration)
		.attr("d", diagonal);

	link.exit().transition().duration(duration)
		.attr("d", d => {
			const o = { x: source.x, y: source.y };
			return diagonal({ source: o, target: o });
		})
		.remove();

	nodes.forEach(d => {
		d.x0 = d.x;
		d.y0 = d.y;
	});
	
    const ended = currentTableau.isEnded();
	if (ended){
		leafs.forEach(leaf =>{
			let b = currentTableau.getBranchFromLeaf(leaf)
			const styleColor = b.isClosed() ? 'red' : 'green';
			svg.selectAll("circle")
				.filter(d => d.id == leaf.id)
				.style("stroke",styleColor) //USAR CLASS
		})
	}
}

function computeRadius(d) {
	return (d.children || d._children) ? radius + (radius * nbEndNodes(d) / 10) : radius;
}

function nbEndNodes(d) {
	if (d.children) return d.children.reduce((acc, c) => acc + nbEndNodes(c), 0);
	if (d._children) return d._children.reduce((acc, c) => acc + nbEndNodes(c), 0);
	return 1;
}

function click(event, d) {
	if (d.children) {
		d._children = d.children;
		d.children = null;
	} else {
		d.children = d._children;
		d._children = null;
	}
	update(d);
	// highlightLink(d)

}

function dblClick(event, d) {
	columnAttribute.push(d.data.name);
}

function rclick(event, d) {
	event.preventDefault();
	if (currentTableau) {
		let closedLeafs = currentTableau.applyRule(d.id, logger);
		const newTreeData = currentTableau.toD3();
		root = d3.hierarchy(newTreeData, (d) => d.children);
		root.each(function(d) {
			d.id = d.data.id || d.id;  // ID not overwritten!!!!
		});
		root.x0 = container.clientWidth / 2;
		root.y0 = 0;
		// TODO: UNIFY IN THE BRAIN
		let leafs = currentTableau.getLeafs().map(x => x.id)
		if(currentTableau.isEnded()){
			if(!leafs.includes(Number(d.id))){
				logger.addLog(`[Error] Can not apply rule to ID: ${d.id})} because tableau is finised.`);
			}else{
				let leaf = currentTableau.getNodeFromId(d.id);
				let b = currentTableau.getBranchFromLeaf(leaf);
				let negNode = b.getContradictoryNode();
				if (!negNode){
					negNode = root
					console.log("HOA")
				}
				let negD3Node = svg.selectAll("circle")
						.filter(d => d.id == negNode.id)
				const styleColor = b.isClosed() ? 'red' : 'green';
				negD3Node.style("stroke", styleColor)
				const target =negD3Node.datum()
				let current = d;
				const linksToHighlight = [];
				while (current !== target && current.parent) {
					linksToHighlight.push({ source: current.parent, target: current });
					current = current.parent;
				}
				svg.selectAll("circle")
					.filter(d => (d.id != negNode.id)&&(d.id != leaf.id))
					.style("stroke", "gray"); // los que no coinciden

				d3.selectAll("path.link")
					.style("stroke", d => 
						linksToHighlight.some(l => l.source === d.source && l.target === d.target)
						? styleColor : "gray"
					)
					.style("stroke-width", d => 
						linksToHighlight.some(l => l.source === d.source && l.target === d.target)
						? 3 : 1.5
					)
			}
	}else if (closedLeafs == null){
			logger.addLog(`[Error] Can not apply rule to ID: ${d.id})}`);
		}
		update(d);
	}
}

function getVisibleDepth(node, depth = 0) {
	if (!node.children) return depth;
	return Math.max(...node.children.map(child => getVisibleDepth(child, depth + 1)));
}

function displayLogsInHTML(logger) {
	const logContainer = document.getElementById('log-container');
	logContainer.innerHTML = '';
	const logs = logger.getLogs();

	logs.forEach(log => {
		const logElement = document.createElement('div');
		logElement.className = `log-entry log-${log.type}`;
		logElement.innerHTML = `<span class="message">${log.message}</span>`;
		logContainer.appendChild(logElement);
	});
}


function highlightLink(node) {
    if (node.children && node.children.length > 0){
		update(node);
		return;
	};
    const path = getPathToRoot(node);
    svg.selectAll("path.link")
        .transition().duration(400)
        .style("stroke", d => {
            return path.includes(d.source) && path.includes(d.target) ? 'red' : '#ccc';
        });

    svg.selectAll(".node")
        .transition().duration(400)
        .style("fill", d => path.includes(d) ? 'red' : '#000');
}

function getPathToRoot(node) {
    const path = [];
    let current = node;
    while (current) {
        path.push(current);
        current = current.parent;
    }
    return path;
}

function clear(){
	logger.clearLogs();
	document.getElementById('formulaInput').value = '';
    document.getElementById('tree-container').innerHTML = "";
    displayLogsInHTML(logger)
}

function animationContradiction(element) {
	vibrate(element, () => {
		strokeColorAnimation(element);
	});
}

function vibrate(element, onEnd) {
	let i = 0;
	const steps = 20;
	const interval = 50;

	const vibrateInterval = setInterval(() => {
		const dx = (Math.random() - 0.5) * 2;
		const dy = (Math.random() - 0.5) * 2;

		d3.select(element).attr("transform", `translate(${dx}, ${dy})`);
		i++;

		if (i >= steps) {
			clearInterval(vibrateInterval);
			d3.select(element).attr("transform", null); // reset

			if (typeof onEnd === "function") {
				onEnd(); // ejecutar cuando termine
			}
		}
	}, interval);
}

function strokeColorAnimation(element, duration = 500) {
	d3.select(element)
		.transition()
		.duration(duration)
		.style("stroke", 'gray');
}

function animatePath(pathSelection) {
  const path = pathSelection.node();
  const length = path.getTotalLength();

  pathSelection
    .style("stroke-dasharray", length)
    .style("stroke-dashoffset", length)
    .transition()
    .duration(1000)          // duración de la animación en ms
    .ease(d3.easeLinear)
    .style("stroke-dashoffset", 0);
}
