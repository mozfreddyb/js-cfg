
window.onload = function() {
 ast = {
    "type": "Program",
    "body": [
      {
        "type": "VariableDeclaration",
        "declarations": [
          {
            "type": "VariableDeclarator",
            "id": {
              "type": "Identifier",
              "name": "answer"
            },
            "init": {
              "type": "BinaryExpression",
              "operator": "*",
              "left": {
                "type": "Literal",
                "value": 6,
                "raw": "6"
              },
              "right": {
                "type": "Literal",
                "value": 7,
                "raw": "7"
              }
            }
          }
        ],
        "kind": "var"
      }
    ]
  };


  // Add event listener on generate-button
  var btnGenerate = document.getElementById("btnGenerate");
  btnGenerate.addEventListener("click", function() {
    var txt = document.getElementById("jscode").value;
    if (txt != "") {
      var ast = esprima.parse(txt);
      var g = new BasicBlockView(ast);
      var svg = Viz(g.toDot(), 'svg');
      var svgarea = document.getElementById("svgarea");
      svgarea.innerHTML += svg;
    }
  })

  document.getElementById('files').addEventListener('change', handleFile, false);

}


 function handleFile(evt) {
    var files = evt.target.files;
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
      ///
      if (!f.type.match('text.*')) {
        console.log("Skipped invalid file format " + f.type );
        continue;
      }

      var reader = new FileReader();
      reader.onload = (function(aFile) {
        return function(e) {
          var text = e.target.result;
          document.getElementById("jscode").value = text;
        };
      })(f);
      reader.readAsText(f);

      //console.log("Stopping after first file..");
      break;
    }
 }


