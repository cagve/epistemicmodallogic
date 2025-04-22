// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
//
//
//
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

function displayLogsInHTML(logger) {
    const logContainer = document.getElementById('log-container');
    logContainer.innerHTML = ''; // Limpiar el contenedor antes de actualizar

    const logs = logger.getLogs();
    
    logs.forEach(log => {
        const logElement = document.createElement('div');
        logElement.className = `log-entry log-${log.type}`; // Para estilizar según el tipo (info, error, etc.)
        
        // logElement.innerHTML = `
        //     <span class="timestamp">[${log.timestamp}]</span>
        //     <span class="message">${log.message}</span>
        // `;
        
        logElement.innerHTML = `
            <span class="message">${log.message}</span>
        `;
        
        logContainer.appendChild(logElement);
    });
}

function run(tableau) {
	// Obtener fórmula desde el input
	// var formula = document.getElementById('formulaInput').value;

	// Crear nuevo Tableau y generar datos
	// const tableau = new Tableau(formula);
	// const logger = tableau.runTableau();
	const treeData = tableau.toD3();

	// Resetear variables globales si es necesario
	i = 0;
	columnAttribute = [];

	// Eliminar SVG anterior
	d3.select("#tree-container").selectAll("*").remove();

	// Recrear SVG y configuración base
	var svgContainer = d3.select("#tree-container").append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(0," + maxLabel + ")");

	svg = svgContainer;

	root = treeData;
	root.x0 = width / 2;
	root.y0 = 0;

	tree = d3.layout.tree().size([width, height]);
	diagonal = d3.svg.diagonal().projection(d => [d.x, d.y]);

	// Colapsar nodos hijos al inicio
	// if (root.children) {
		// root.children.forEach(collapse);
	// }

	update(root);
}

var formula = document.getElementById('formulaInput').value 
const tableau = new Tableau(formula);
const logger = tableau.runTableau()
const treeData = tableau.toD3();
tableau.preOrderTraversal()

var width = 700;
var height = 650;
var maxLabel = 150;
var duration = 500;
var radius = 5;
    
var i = 0;
var root;
var columnAttribute = [] ;

var tree = d3.layout.tree()
    .size([width, height]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.x, d.y]; });


var svg = d3.select("#tree-container").append("svg")
    .attr("width", width)
    .attr("height", height)
        .append("g")
	.attr("transform", "translate(0," + maxLabel + ")");
        // .attr("transform", "translate(" + maxLabel + ",0)");

root = treeData;
root.x0 = width / 2;
root.y0 = 0;

console.log(treeData)



// if (root.children) {
// 	root.children.forEach(collapse);
// }

function update(source) 
{
	let visibleDepth = getVisibleDepth(root);
	height = (visibleDepth + 2) * maxLabel; 
	tree.size([width, height]);
	d3.select("svg")
		.transition()
		.duration(duration)
		.attr("height", height);

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse();
    var links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * maxLabel; });

    // Update the nodes…
    var node = svg.selectAll("g.node")
        .data(nodes, function(d){ 
            return d.id || (d.id = ++i); 
        });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", function(d){ return "translate(" + source.x0 + "," + source.y0 + ")"; })
        .on("click", click)
        .on("dblclick", dblClick)

    nodeEnter.append("circle")
        .attr("r", 0)
        .style("fill", function(d){ 
            return d._children ? "lightsteelblue" : "white"; 
        });

    nodeEnter.append("text")
        .attr("x", function(d){ 
            var spacing = computeRadius(d) + 5;
            return d.children || d._children ? -spacing : spacing; 
        })
        .attr("dy", "3")
        .attr("text-anchor", function(d){ return d.children || d._children ? "end" : "start"; })
		.text(d => `(${d.id}) ${d.label}: ${d.value.unicode()}`)
        .style("fill-opacity", 0);

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    nodeUpdate.select("circle")
        .attr("r", function(d){ return computeRadius(d); })
        .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeUpdate.select("text").style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + source.x + "," + source.y + ")"; })
        .remove();

    nodeExit.select("circle").attr("r", 0);
    nodeExit.select("text").style("fill-opacity", 0);

    // Update the links…
    var link = svg.selectAll("path.link")
        .data(links, function(d){ return d.target.id; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d){
            var o = {x: source.x0, y: source.y0};
            return diagonal({source: o, target: o});
        });

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function(d){
            var o = {x: source.x, y: source.y};
            return diagonal({source: o, target: o});
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d){
        d.x0 = d.x;
        d.y0 = d.y;
    });
}

function computeRadius(d)
{
    if(d.children || d._children) return radius + (radius * nbEndNodes(d) / 10);
    else return radius;
}

function nbEndNodes(n)
{
    var nb = 0;    
    if(n.children){
        n.children.forEach(function(c){ 
            nb += nbEndNodes(c); 
        });
    }
    else if(n._children){
        n._children.forEach(function(c){ 
            nb += nbEndNodes(c); 
        });
    }
    else nb++;
    
    return nb;
}

function click(d)
{
    // if (d.children){
    //     d._children = d.children;
    //     d.children = null;
    // } 
    // else{
    //     d.children = d._children;
    //     d._children = null;
    // }
	console.log("DEBUG CLICK")
	let node = treeTOD3(root);
	let newTableau1 = new Tableau('p');
	run(newTableau1)
	let newTableau2 = new Tableau(node);
	run(newTableau2)
    update(d);
}

function dblClick(d) {
    columnAttribute.push(d.name);
    console.log(columnAttribute);
}
function collapse(d){
    if (d.children){
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
    }
}


function getVisibleDepth(node, depth = 0) {
    if (!node.children) return depth;
    return Math.max(...node.children.map(child => getVisibleDepth(child, depth + 1)));
}

function getBranchs(node, branch = [], branchs = []) {
    branch.push(node);

    if (!node.children || node.children.length === 0) {
        branchs.push([...branch]);
    } else {
        node.children.forEach(child => {
            getBranchs(child, branch, branchs);
        });
    }

    branch.pop();
    return branchs;
}


function getBranchsNode(node, root) {
    const allBranchs = getBranchs(root);
    return allBranchs.filter(path => path.includes(node));
}

function treeTOD3(node){
	var copy  = {
		name: node.value.toString(),
		id: node.id.toString(),
		value: node.value,
		label: node.label,
	}
	
    if (node.children && node.children.length > 0) {
        copy.children = node.children.map(child => treeTOD3(child));
    }
    return copy;
}



update(root);


