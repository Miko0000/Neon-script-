let term;
let termTab;

function termLoader(){
  term = new Terminal();
  term.open(document.querySelector('.terminal-tab .terminal'));
  //term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ');

  term.options.fontSize = 13;
  term.options.cursorBlink = true;

  termTab = document.querySelector(".terminal-tab");
  termTab.classList.add("active");

  commands.term = term;
  commands.start();

  term.onData((data) => termOnData.call(term, commands, data));
  term.onKey((data) => termOnKey.call(term, commands, data));
}

function termOnControl(commands, key){
  const code = key.charCodeAt();
  if(code == 13){
    commands.enter();
  }
}

function termOnData(commands, data){
  if(data.charCodeAt() <= 31)
    return termOnControl.call(this, commands, data);

  if(data.charCodeAt() >= 127)
    return termOnControl.call(this, commands, data);

  commands.buffer += data;
  term.write(data);
}

function termOnKey(commands, { key }){
  if(key.charCodeAt() !== 127)
    return ;

  if(!commands.buffer)
    return ;

  commands.buffer = commands.buffer.slice(0, -1);
  term.write("\033[1D \033[1D");
}

function toggleTerminal(){
  const tab = document.querySelector(".terminal-tab");
  const button = tab.querySelector("#toggleTerminal");
  //button.textContent = tab.textContent.includes("A") ? 'V' : 'A';
  button.classList.toggle("active");
  tab.classList.toggle("active");
}

class Commands extends Map {
  constructor(term){
    super();

    this.term = term;
    this.buffer = '';
    this.PS1 = "[\x1B[4;96mneon\x1b[0m\\ ";
  }
}

Commands.prototype._set = Commands.prototype.set;
Commands.prototype.set = function(name, handler){
  return this._set(name, new Command(this, name, handler));
}

Commands.prototype.start = async function(){
  this.get("help").handler();
  this.loop();
}

Commands.prototype.enter = async function(){
  const [ command, ...args ] = this.buffer.split(/ +/);
  const handler = this.get(command);

  if(!handler){
    this.term.write(`\n\r\x1b[91mError\x1b[0m: \x1b[40;97m${command}\x1b[0m`
        + ` command not found.`
    );

    this.loop();

    return ;
  }

  await handler.handler(args);
  this.loop();
}

Commands.prototype.loop = function(){
  this.buffer = '';
  term.write(`\n\r${this.PS1}`);
}

class Command {
  constructor(commands, name, handler){
    this.name = name;
    this.handler = handler;
    this.commands = commands;
  }
}

const commands = new Commands();