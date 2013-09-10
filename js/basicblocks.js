// standalone, for now.
if( typeof (require) != 'undefined') {
  var escodegen = require("escodegen");
}
// requires graph


function BasicBlockView(ast) {
  this.functions = {}; // {'foo' : {...} ,  bar: {..} }
  this.ast = ast;
  graph = new Graph();

  this.curNode = newBlock({}, "// START\n");
  function codeGen(ast) {
    if (typeof ast === "undefined") {
      return "undefined";
    }
    return escodegen.generate(ast); // to be replaced with something that does syntax highlight for HTML stuff
  }
  function newBlock(n, t) {
    var te = t || '';
    var no = n || {};
    return graph.addNode({text: te, ast: no}).id;
  }
  function linkBlocks(n1, n2, astobj, t) {
    var te = t || "";
    return graph.linkNodes(n1, n2, {text: te, ast: astobj });
  }

  function identifyLeaders(ast) {
    //The target of a conditional or an unconditional goto/jump instruction is a leader.
    //The instruction that immediately follows a conditional or an unconditional goto/jump instruction is a leader.

    //if....

  }
  this.appendToNode = function(astNode) {
    var nd = graph.getNode(this.curNode);
    // update object on node by adding this declaration/statement:
    nd.data.ast = astNode;
    var code = codeGen(astNode);
    if ((!code.endsWith(";"))) {
      code = code+= ";";
    }
    nd.data.text +=  code+"\n";
  }
  this.ast2blocks = function (astNode, settings) { // init ..
    console.group();
    console.log(astNode.type);
    console.log(codeGen(astNode));
    console.groupEnd();
    switch (astNode.type) {
      case 'BlockStatement':
        // a piece of code enclosed by { and }. fall through---v
      case 'Program':{
        for (var statement in astNode.body) {
          var prevNode = this.curNode
          var node = this.ast2blocks(astNode.body[statement]);
          if (prevNode != node) {
            // the statement has created a new block, we have to continue with another new block
            this.curNode = newBlock(); //XXX this also creates an empty/stale blocks at the very end sometimes...
            linkBlocks(node, this.curNode, {});


          }
        }
        break;
      }
      case 'ExpressionStatement':{
        this.ast2blocks(astNode.expression);
        break;
      }
      case 'IfStatement':{
        var prevNode = this.curNode;
        var ifBlock = newBlock(astNode.consequent);
        this.curNode = ifBlock;
        this.ast2blocks(astNode.consequent);
        linkBlocks(prevNode, ifBlock, astNode.test, codeGen(astNode.test));

        if (astNode.hasOwnProperty('alternate') && astNode.alternate != null) { // else block
          var elseBlock = newBlock(astNode.alternate);
          this.curNode = elseBlock;
          this.ast2blocks(astNode.alternate);
          linkBlocks(prevNode, elseBlock, astNode.test, '!(' + codeGen(astNode.test)+')')
        }
        break;
      }
      case 'WhileStatement':{
        var whileBlock = newBlock(astNode.body);
        linkBlocks(this.curNode, whileBlock, astNode.test, codeGen(astNode.test));
        this.curNode = whileBlock;
        this.ast2blocks(astNode.body);
        linkBlocks(whileBlock, whileBlock, astNode.test, codeGen(astNode.test));
        break;
      }
      case 'TryStatement':{
        var tryBlock = newBlock(astNode.block);
        linkBlocks(this.curNode, tryBlock, {}, "try");
        this.curNode = tryBlock;
        this.ast2blocks(astNode.block);

        if (astNode.hasOwnProperty('handlers') && astNode.handlers != null) {
          for (var i=0; i < astNode.handlers.length; ++i) {
            handler = astNode.handlers[i];
            var catchBlock = newBlock(handler.body);
            // handler.guard unused.
            this.curNode = catchBlock;
            this.ast2blocks(handler.body);
            linkBlocks(tryBlock, catchBlock, handler.param, "Exception (" + codeGen(handler.param) + ")");
          }
        }
        if (astNode.hasOwnProperty('finalizer') && astNode.finalizer != null) {
          var finalBlock = newBlock(astNode.finalizer);
          this.curNode = finalBlock;
          this.ast2blocks(astNode.finalizer);
          if (typeof catchBlock !== "undefined") {
            linkBlocks(catchBlock, finalBlock, {}, "Finally"); // finally
          }
          linkBlocks(tryBlock, finalBlock, {}, "Finally"); // finally
        }
        break;
      }
      case 'DoWhileStatement':{
        var whileBlock = newBlock(astNode.body);
        linkBlocks(this.curNode, whileBlock, {}, "do");
        this.curNode = whileBlock;
        this.ast2blocks(astNode.body);
        linkBlocks(whileBlock, whileBlock, astNode.test, "while (" + codeGen(astNode.test) + ")");
        break;
      }
      case 'ForStatement':{
        this.appendToNode(astNode.init);

        var forBlock = newBlock(astNode.body);
        linkBlocks(this.curNode, forBlock, astNode.test, "for ("+ codeGen(astNode.init) +";"+ codeGen(astNode.test) +";"+ codeGen(astNode.update) +")");
        this.curNode = forBlock;
        this.ast2blocks(astNode.body);
        linkBlocks(forBlock, forBlock, astNode.test, codeGen(astNode.test));

        break;
      }
      case 'ForInStatement': // fall through. of or in, doesn't matter *now*
      case 'ForOfStatement':{
        var forBlock = newBlock(astNode.body);

        var forInorOfText = "next of (for "+ codeGen(astNode.left) +(astNode.type == "ForOfStatement" ? " of " : " in ")+ codeGen(astNode.right) + ")";
        linkBlocks(this.curNode, forBlock, {}, forInorOfText);
        this.curNode = forBlock
        this.ast2blocks(astNode.body);

        linkBlocks(forBlock, forBlock, {}, forInorOfText);

/*        left: VariableDeclaration |  Expression;
        right: Expression;
        body: Statement;
        each: boolean;
      }
*/
        break;
      }
      case 'BreakStatement':{
        break;
      }
      case 'ThrowStatement':{
        // like return!?!?
        break;
      }
      case 'ReturnStatement':{
        //out-edge to outer function
        break;
      }
      case 'ContinueStatement':{
        //out-edge to outer block
        break;
      }
      case 'WithStatement':{
        // should be no-op since it doesnt affect control-flow, just scope?
        break;
      }
      case 'SwitchStatement':{
        // xx ugh ;>
        break;
      }
      //XX ugh :D new block: 'body', if has 'test' and != null:
      case 'FunctionDeclaration':{
        /*
         id: Identifier;
         params: [ Pattern ];
         defaults: [ Expression ];
         rest: Identifier | null;
         body: BlockStatement | Expression;
        */

        var prevNode = this.curNode
        // there is no scope :/, we should have scope.
        var funcNode = newBlock(astNode, "// Function " + astNode.id.name + ":\n");

        this.curNode = funcNode;
        this.ast2blocks(astNode.body);

        // make a function reference available to be linked again later
        this.functions[astNode.id.name] = funcNode;
        this.curNode = prevNode;
        break;
      }

      // Expressions which will just return a code line
      // fall through..
      case 'VariableDeclaration':
      case 'ArrayExpression':
      case 'ObjectExpression':
      case 'FunctionExpression':
      case 'ArrowExpression':
      case 'SequenceExpression':
      case 'UnaryExpression':
      case 'BinaryExpression':
      case 'AssignmentExpression':
      case 'UpdateExpression':
      case 'LogicalExpression':
      case 'ConditionalExpression':
      case 'MemberExpression':
      case 'LetExpression':{
        this.appendToNode(astNode);
        break;
      }
      case 'CallExpression':
      case 'NewExpression':{
        this.appendToNode(astNode);
        var funcName = codeGen(astNode.callee);
        // could also be console.log(), foo['bar'](); :/
        // find Node of Object/Function delcaration and link to it
        if (funcName in this.functions) {
          linkBlocks(this.curNode, this.functions[funcName], astNode, "Call");
        }
        break;
      }
      default:{
        if (astNode.type.indexOf("Expression") !== -1) {

        }
      }

    }
    return this.curNode;
  }



  this.lastNode = this.ast2blocks(this.ast);
  return graph;
}