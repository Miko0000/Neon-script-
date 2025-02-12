commands.set("help", function help(argv = []){
  const { term } = this.commands;
  term.write("Help\n\r");
});