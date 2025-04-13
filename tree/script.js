const MPL = require('../js/MPL.js');

class Node {
	constructor(id,value, parent = null) {
		this.id = id;
		this.parent = parent;
		this.right = null;
		this.left = null;
		this.value = value;
	}
	
	isRoot(){
		return this.parent === null;
	}

	applyRule(){
		const formula = this.value.json();
		console.log(formula)
		if (formula.prop){
			console.log(prop)
		}else if(formula.conj){ 
			console.log('conjuncion')
		} else if(formula.neg && formula.neg.conj ){
			console.log('negacion conjuncion')
		}else{
			console.log("HOLA")
		}
	}

	//formula = MLP formula
	addSingleChild(id, formula){
		if (this.left === null){
			this.left = new Node(id, formula, this)
		}else{
			this.left.addSingleChild(id, formula)
		}
	}

	addTwoChildren(id1, formula1, id2, formula2){
		this.left = new Node(id1, formula1, this);
		this.right = new Node(id2, formula2, this);
	}
}


class Tableau {
	constructor(formula) {
		this.root = new Node(1,formula, null);
		this.alpha_group = []
		this.beta_group = []
		this.nu_group = []
		this.pi_group = []
	}

	getLeafs(node = this.root, leafs=null){
		if (leafs === null){
			leafs = []
		}

		if (node === null){
			return;
		}
		if (node.left === null && node.right === null){
            leafs.push(node)
		}else{
            this.getLeafs(node.left, leafs) 
			if(node.right !== null){
				this.getLeafs(node.right, leafs)
			}
		}
		return leafs;
	}

	addSingleExtension(formula){
		const leafs = this.getLeafs(this.root);
		leafs.forEach(node => {
			var newId = parseInt(node.id + '1');
			node.addSingleChild(newId, formula);
			//Falta añadir a disponibles. this.addto
		})
	}

	addDoubleExtension(formula1, formula2){
		const leafs = this.getLeafs(this.root);
		leafs.forEach(node => {
			var newId1 = parseInt(node.id + '1');
			var newId2 = parseInt(node.id + '2');
			node.addTwoChildren(newId1, formula1,  newId2, formula2);
			//Falta añadir a disponibles. this.addto
		})
	}

	preOrderTraversal(node = this.root){
		if(node === null){
			return
		}
		console.log(node.value + ", ")
		this.preOrderTraversal(node.left);
		this.preOrderTraversal(node.right);
	}

	getBranchFromLeaf(leafNode) {
		// Verificar que el nodo sea una hoja
		if (leafNode.left !== null || leafNode.right !== null) {
			throw new Error("The node is not a leaf");
		}

		const branch = new Branch();
		let currentNode = leafNode;

		while (currentNode !== null) {
			branch.addNode(currentNode);
			currentNode = currentNode.parent;
		}
		branch.nodes.reverse();
		return branch;
	}

	toD3(node = this.root){
		if (!node) return null;

		const d3Node = {
			name: node.value.toString(),
			id: node.id.toString(),
			value: node.value,
			children: []
		};
		if (node.left) {
			d3Node.children.push(this.toD3(node.left));
		}
		if (node.right) {
			d3Node.children.push(this.toD3(node.right));
		}
		if (d3Node.children.length === 0) {
			delete d3Node.children;
		}
		return d3Node;
	}
}


class Branch {
	constructor() {
		this.nodes = [];
	}

	addNode(node) {
		this.nodes.push(node);
	}
}


var wff = new MPL.Wff('~(p&q)');
const tree = new Tableau(wff);
const root = tree.root;
const leafs = tree.getLeafs();
const leaf = leafs[0]
tree.root.applyRule()
