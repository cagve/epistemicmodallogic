document.addEventListener('DOMContentLoaded', function() {
	// TABLEAU CREATION -- HARDCODE
	const tableau = new Tableau('p&q');
	tableau.addSingleExtension('p');
	tableau.addSingleExtension('q');
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

  // Aplicar layout a los datos
  treeLayout(root);

  // Dibujar enlaces
  svg.selectAll(".link")
    .data(root.links())
    .enter().append("path")
    .attr("class", "link")
    .attr("d", d3.linkVertical()
      .x(d => d.x)
      .y(d => d.y));

  // Crear grupos de nodos
  const node = svg.selectAll(".node")
    .data(root.descendants())
    .enter().append("g")
    .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))
    .attr("transform", d => `translate(${d.x},${d.y})`);

  // Añadir círculos a los nodos
  node.append("circle")
    .attr("r", d => Math.sqrt(d.value || 10) + 5); // Tamaño proporcional al valor

  // Añadir texto a los nodos
  node.append("text")
    .attr("dy", ".35em")
    .attr("y", d => d.children ? -20 : 20)
    .style("text-anchor", "middle")
    .text(d => d.data.value);
});
