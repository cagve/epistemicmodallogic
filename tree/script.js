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


	//formula = MLP formula
	addSingleChild(id, formula){
		if (this.left === null){
			let node = new Node(id, formula, this)
			this.left = node
			return node;
		}else{
			this.left.addSingleChild(id, formula)
		}
	}

	addTwoChildren(id1, formula1, id2, formula2){
		const node1 = new Node(id1, formula1, this);
		const node2 = new Node(id2, formula2, this);
		this.left = node1
		this.right = node2
		return [node1, node2]
	}

	typeOf(){
		const formula = this.value.json();
		if (formula.prop){
			return "prop"
		}else if(formula.conj){ 
			return "conj"
		} else if(formula.neg){
			if(formula.neg.conj){
				return "neg_conj"
			}else if(formula.neg.neg){
				return "neg_neg"
			}else if(formula.neg.prop){
				return "prop"
			}
		}else{
			return null
		}
	}

	typeOfRule(){
		const type = this.typeOf()
		switch (type) {
			case "prop":
				return "prop"
			case "conj":
				return "alpha"
			case "neg_conj":
				return "beta"
		}
	}
}


class Tableau {
	constructor(formula) {
		this.root = new Node(1,new MPL.Wff(formula), null);
		this.alpha_group = []
		this.beta_group = []
		this.nu_group = []
		this.pi_group = []
		this.addAvailableNode(this.root)
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
	
	applyRule(node){
		this.removeAvailableNode(node)
		const formula = node.value.json();
		if (formula.prop){
			console.log("No more rules applied here")
		}else if(formula.conj){ 
			const formula1 = new MPL.Wff(MPL._jsonToASCII(formula.conj[0]))
			const formula2 = new MPL.Wff(MPL._jsonToASCII(formula.conj[1]))
			this.addSingleExtension(formula1)
			this.addSingleExtension(formula2)
		} else if(formula.neg){
			if(formula.neg.conj){
				const f1 = MPL.negateWff(formula.neg.conj[0]);
				const f2 = MPL.negateWff(formula.neg.conj[1]);
				this.addDoubleExtension(f1,f2);
			}else if(formula.neg.neg){
				console.log("Doble negacion")
			}else if(formula.neg.prop){
				console.log("No more rules applied here!")
			}
		}else{
			return null
		}
	}

	addSingleExtension(formula){
		const leafs = this.getLeafs(this.root);
		leafs.forEach(node => {
			var newId = parseInt(node.id + '1');
			const newNode = node.addSingleChild(newId, formula);
			this.addAvailableNode(newNode);
		})
	}

	addDoubleExtension(formula1, formula2){
		const leafs = this.getLeafs(this.root);
		leafs.forEach(node => {
			var newId1 = parseInt(node.id + '1');
			var newId2 = parseInt(node.id + '2');
			let [newNode1, newNode2] = node.addTwoChildren(newId1, formula1,  newId2, formula2);
			this.addAvailableNode(newNode1)
			this.addAvailableNode(newNode2)
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
			return null
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

	addAvailableNode(node){
		const type = node.typeOfRule()
		switch (type){
			case "alpha":
				this.alpha_group.push(node)
				break;
			case "beta":
				this.beta_group.push(node)
				break;
			default:
				return null;
		}
	}

	removeAvailableNode(node){
		const type = node.typeOfRule()
		switch (type){
			case "alpha":
				const idx_alpha = this.alpha_group.indexOf(node);
				this.alpha_group.splice(idx_alpha, 1);
				break;
			case "beta":
				const index = this.beta_group.indexOf(node);
				this.beta_group.splice(index, 1);
				break;
			default:
				return null
		}
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

	runTableau(){
		while (this.alpha_group.length > 0 || this.beta_group.length > 0){
			this.alpha_group.forEach(node =>{
				console.log("Applying rule to ")
				this.applyRule(node);
			})
			this.beta_group.forEach(node =>{
				console.log("New rule applied")
				this.applyRule(node);
			})
		}
		console.log("No more rule to applied")
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



window.Node = Node;
window.Tableau = Tableau;
window.Branch = Branch;


