import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";



document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('run-button').addEventListener('click', run);
});

const formulaInput = document.getElementById('formulaInput'); 
formulaInput.addEventListener('keydown', function(event) {
	if (event.key === 'Enter') {
		event.preventDefault();
		run();
	}
});

function run(){
	cleanGraph()
	var formula = document.getElementById('formulaInput').value 
	const radius = 10;
	const tableau = new Tableau(formula);
	// const tableau = new Tableau('((p&q) & ~(p&q)) | ((p&q) & ~(p&q))');
	tableau.runTableau()
	const treeData = tableau.toD3();

	// Configuración del árbol
	const margin = { top: 50, right: 120, bottom: 50, left: 120 };
	const container = d3.select("#tree-container");
	const containerWidth = container.node().getBoundingClientRect().width;
	const width = 1000 - margin.left - margin.right;
	const height = 600 - margin.top - margin.bottom;

	// Crear SVG
	const svg = d3.select("#tree-container").append("svg")
		.attr("width", "100%")
		.attr("height", height + margin.top + margin.bottom);
	// .attr("width", width + margin.left + margin.right)
	// .attr("height", height + margin.top + margin.bottom);

	const g = svg.append("g")
		.attr("transform", `translate(${margin.left},${margin.top})`);

	// Crear jerarquía
	const root = d3.hierarchy(treeData);

	// Configurar layout del árbol
	const treeLayout = d3.tree().size([width, height]);

	// TREE LAYOUT
	treeLayout(root);

	// LINKS
	g.selectAll(".link")
		.data(root.links())
		.enter().append("path")
		.attr("class", "link")
		.attr("d", d3.linkVertical()
			.x(d => d.x)
			.y(d => d.y));

	// GROUP NODES
	const nodes = g.selectAll(".node")
		.data(root.descendants())
		.enter().append("g")
		.attr("id", d => d.data.id)
		.attr("transform", d => `translate(${d.x},${d.y})`)
		.attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"));

	// COLOR NODES 
	const leafs = g.selectAll('.node--leaf')
		.attr("class", function(d) {
			var node = tableau.getNodeFromLeafId(d.data.id);
			let branch = tableau.getBranchFromLeaf(node);
			return branch.isClosed() ? "close-leaf" : "open-leaf";
		});

	nodes.append("circle")
		.attr("r", radius);

	// Añadir texto a los nodos
	nodes.append("text")
		.attr("dy", ".35em")
		.attr("x", radius+5)
		.style("text-anchor", "right")
		.text(d => `${d.data.label}: ${d.data.value.unicode()}`);

	// Configurar zoom
	let currentScale = 1;
	const zoom = d3.zoom()
		.scaleExtent([0.1, 5])
		.on("zoom", (event) => {
			currentScale = event.transform.k;
			g.attr("transform", event.transform);
		});

	svg.call(zoom);
}


function cleanGraph(){
	d3.select("#tree-container").selectAll("*").remove();
}

