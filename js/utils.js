
// When the button is clicked.
document.getElementById('readFileButton').addEventListener('click', function() {
    document.getElementById('fileInput').click();
});

// 
document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0]; // Obtiene el archivo seleccionado

    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
			updateModel(e.target.result); //TODO parser
        };

        reader.onerror = function(e) {
            console.error("Error al leer el archivo:", e.target.error);
        };

        reader.readAsText(file);
    } else {
        console.log("No se seleccionó ningún archivo.");
    }
});

