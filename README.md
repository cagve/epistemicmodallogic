Epistemic Logic Playground(FORK for T4TL)
======================
This project is based on the open-source <a href="http://rkirsling.github.io/modallogic/">Epistemic Logic Playground</a> by <a href="https://github.com/vezwork/">Elliot vezwork
</a> and <a href="http://rkirsling.github.io/modallogic/">Modal Logic Playground</a> by <a href="https://github.com/rkirsling">Ross Kirsling</a>.

The Epistemic Logic Playground is a graphical semantic calculator for Dynamic Epistemic logic, built using [D3](http://d3js.org/), [MathJax](http://www.mathjax.org/), and [Bootstrap](http://getbootstrap.com/).

See it in action at [epistemicmodallogic](https://cagve.github.io/epistemicmodallogic/?model=;AS?formula=)

### Reusable code
* The core part of the code is MPL.js, a library for parsing and evaluating well-formed formulas of modal propositional logic. See the API Reference [here](API-Reference.md).
* I've also extracted the directed graph editing code so that it can be easily repurposed. You can find it [here](http://bl.ocks.org/rkirsling/5001347).
