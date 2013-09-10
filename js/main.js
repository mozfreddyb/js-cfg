
window.onload = function() {
  var jscode = document.getElementById("jscode");
  if (location.hash.length > 1) {
    try {
      var code = atob(location.hash.slice(1))
    } catch(e) {
      // presumable b64 error
      var code = location.hash.slice(1);
    }
    jscode.value = code;
  }

  // Add event listener on generate-button
  var btnGenerate = document.getElementById("btnGenerate");
  btnGenerate.addEventListener("click", function() {
    var jscode = document.getElementById("jscode");
    if (jscode.value != "") {
      try {
      var ast = esprima.parse(jscode.value);
      } catch(e) {
        alert("Error when parsing source code: " + e.message)
      }
      var g = new BasicBlockView(ast);
      //window.g = g;
      var svg = Viz(g.toDot(), 'svg');
      var svgarea = document.getElementById("svgarea");
      svgarea.innerHTML = svg;
      // Ugliest hack to rewrite SVG file so the text is perfectly aligned. I feel bad..a bit :-)
      alignSvg(svgarea.children[0]);
    }
  });
  document.getElementById('files').addEventListener('change', handleFile, false);
};

 function handleFile(evt) {
    var files = evt.target.files;
    for (var i = 0, f; f = files[i]; i++) {
      if (!f.type.match('text.*')) {
        console.log("Skipped invalid file format " + f.type );
        continue;
      }

      var reader = new FileReader();
      reader.onload = (function(aFile) {
        return function(aEvt) {
          document.getElementById("jscode").value = aEvt.target.result;
        };
      })(f);
      reader.readAsText(f);

      //console.log("Stopping after first file..");
      break;
    }
 }


function alignSvg(svgTree) {
    var iter = document.createNodeIterator(svgTree, NodeFilter.SHOW_ALL, null, false);
    var node;
    while (node = iter.nextNode()) {
      if (node.nodeType == Node.ELEMENT_NODE) {
        if ( node.id.startsWith("node")) {
          // An element with an id like "node1", and so forth is a code block
          if ((node.children.length > 2)&& (node.children[1].tagName == "polygon")) {
            var pointsArr = node.children[1].getAttribute("points").split(" ");
            var minp = Infinity;
            // for x,y in points. take min x value above zero. round and add +5.
            // for all text children: take this value for x, and .removeAttribute("text-anchor")
            for (var pNo in pointsArr) {
              var tp = pointsArr[pNo];
              var po = tp.split(",");
              var x = parseInt(po[0]);
              // var y = po[1]; // never used
              if ((x < minp) && (x > -1)) { minp = x; }
            }
            var newX = Math.round(minp) + 5;
            for (var cNo in node.children) {
              var cn = node.children[cNo];
              if (cn.tagName == "text") {
                cn.removeAttribute("text-anchor");
                cn.setAttribute("x", newX);
            }
          }
        }
      }
    }
  }

}