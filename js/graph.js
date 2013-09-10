function Graph() {
  // private
  var nodes = [];
  var edges = [];
  function edge(a, b, obj) {
    this.id = this.constructor.id++;
    this.from = a.hasOwnProperty('id') ? a.id : a;
    this.to = b.hasOwnProperty('id') ? b.id : b;
    this.data = obj || {};
  }
  edge.id = 0;
  function node(obj) { // "vertex" ;)
    this.id = this.constructor.id++;
    this.edges_in = [];
    this.edges_out = [];
    this.data = obj;
  }
  node.id = 0;

  // public
  this.addNode = function(obj) {
    var n = new node(obj);
    nodes.push(n);
    return n;
  }
  this.getNodes = function() {
    return nodes;
  }
  this.getNode = function(i) {
    return nodes[i];
  }
  this.getEdges = function() {
    return edges;
  }
  this.getEdge = function(i) {
    return edges[i];
  }
  this.linkNodes = function(n1, n2, edgeData) {
    var node1 = this.getNode(n1.hasOwnProperty('id') ? n1.id : n1);
    var node2 = this.getNode(n2.hasOwnProperty('id') ? n2.id : n2);
    var data = edgeData || {};
    var edg = new edge(node1.id, node2.id, data);
    edges.push(edg);
    node1.edges_out.push(edg.id);
    node2.edges_in.push(edg.id);
    return edg
  }
  this.isAdjacent = function(n1, n2) {
    var node1 = this.getNode(n1.hasOwnProperty('id') ? n1.id : n1);
    var node2 = this.getNode(n2.hasOwnProperty('id') ? n2.id : n2);

    for (var i=0; i< node1.edges_out.length; i++) {
      if (node1.edges_out[i].to == node2) {
        return true;
      }
    }
    return false;
  }
  this.getNextNodes = function(n) {
    var node = this.getNode(n.hasOwnProperty('id') ? n.id : n);
    var list = [];
    for (var i = 0; i < node.edges_out.length; i++) {
      var edg = this.getEdge(node.edges_out[i]);
      list.push(this.getNode(edg.to));
    }
    return list;
  }
  this.getPrevNodes = function(n) {
    var node = this.getNode(n.hasOwnProperty('id') ? n.id : n);
    var list = [];
    for (var i = 0; i < node.edges_in.length; i++) {
      var edg = this.getEdge(node.edges_in[i]);
      list.push(this.getNode(edg.from));
    }
    return list;
  }
  this.toCytoscape = function() {
    var elements = { nodes: [], edges: []};
    for (var n in this.getNodes()) {
      var no = { data: { id: 'n'+n, name: this.getNode(n).data.text } };
      elements.nodes.push(no);
    }
    for (var e in this.getEdges()) {
      var edgeobj = this.getEdge(e);
      var ed = { data: { id: 'e'+e, name: edgeobj.data.text, source: 'n'+edgeobj.from , target: 'n'+edgeobj.to } };
      elements.edges.push(ed);
    }
    return elements;
  }
  this.toDot = function() {
    function strToSrc(s) {
      /* String.toSource() gives us (new String("foobar")), this is a bit ugly.
       * the upside is, that it does string escaping for us.
       * so we use String.toSource() and regex-search for the inner part.
       */
      var newSrc = s.replace(/"/g, '\"');
      newSrc = ( newSrc.toSource() ).match(/\(new String\((.+)\)\)/)[1];
      return newSrc
    }

    var text = "digraph graphname {\n"; // maybe change graphname to something else
    text += "// Nodes:\n";
    for (var n in this.getNodes()) {
      text += 'n'+n + ' [shape=box,label='+ strToSrc(this.getNode(n).data.text) +']' + ';\n';
    }
    text += "// Edges:\n";
    for (var e in this.getEdges()) {
      var edgeobj = this.getEdge(e);
      //var ed = { data: { id: 'e'+e, name: edgeobj.data.text, source: 'n'+edgeobj.from , target: 'n'+edgeobj.to } };
      text += 'n'+edgeobj.from +' -> '+ 'n'+edgeobj.to + ' [label=' + strToSrc(edgeobj.data.text) + '];\n';
    }
    text += "}\n";
    return text
    /* Example dot format:

     digraph graphname {
     // This attribute applies to the graph itself
     size="1,1";
     // The label attribute can be used to change the label of a node
     a [label="Foo"];
     // Here, the node shape is changed.
     b
     // These edges both have different line properties
     a -> b -> c [color=blue];
     b -> d [label="edge label"];
     } */

  }
  // Vertices and edges are stored as records or objects. Each vertex stores its incident edges, and each edge stores
  // its incident vertices. This data structure allows the storage of additional data on vertices and edges.

  /*
   adjacent(G, x, y): tests whether there is an edge from node x to node y.
   neighbors(G, x): lists all nodes y such that there is an edge from x to y.
   add(G, x, y): adds to G the edge from x to y, if it is not there.
   delete(G, x, y): removes the edge from x to y, if it is there.
   get_node_value(G, x): returns the value associated with the node x.
   set_node_value(G, x, a): sets the value associated with the node x to a.

   Structures that associate values to the edges usually also provide:

   get_edge_value(G, x, y): returns the value associated to the edge (x,y).
   set_edge_value(G, x, y, v): sets the value associated to the edge (x,y) to v.
   */
}