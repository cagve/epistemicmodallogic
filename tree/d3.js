import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const radius = 10;


const tableau = new Tableau('p&(~q | ~p)');
tableau.runTableau()
const treeData = tableau.toD3();

// Configuración del árbol
const margin = { top: 50, right: 120, bottom: 50, left: 120 };
const width = 1000 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// Crear SVG
const svg = d3.select("#tree-container").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", `translate(${margin.left},${margin.top})`);

// Crear jerarquía
const root = d3.hierarchy(treeData);

// Configurar layout del árbol
const treeLayout = d3.tree().size([width, height]);

// TREE LAYOUT
treeLayout(root);

// LINKS
svg.selectAll(".link")
	.data(root.links())
	.enter().append("path")
	.attr("class", "link")
	.attr("d", d3.linkVertical()
		.x(d => d.x)
		.y(d => d.y));

// GROUP NODES
const nodes = svg.selectAll(".node")
	.data(root.descendants())
	.enter().append("g")
	.attr("id", d => d.data.id) // Position
	.attr("transform", d => `translate(${d.x},${d.y})`) // Position
	.attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))

// COLOR NODES 
const leafs = svg.selectAll('.node--leaf')
	.attr("class", function(d) {
		var node = tableau.getNodeFromLeafId(d.data.id);
		let branch = tableau.getBranchFromLeaf(node);
		return branch.isClosed() ? "close-leaf" : "open-leaf";
	});

nodes.append("circle")
	.attr("r", radius); //tamaño

// Añadir texto a los nodos
nodes.append("text")
	.attr("dy", ".35em")
	.attr("x", radius+5)
	.style("text-anchor", "right")
	.text(d =>  `${d.data.label}: ${d.data.value.unicode()}`);

