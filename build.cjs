const path=require('node:path');
let esbuild;
try{esbuild=require('esbuild');}catch{console.error('仅修改源代码后需要运行 npm install。已提供可直接运行的 dist 成品。');process.exit(1);}
esbuild.buildSync({entryPoints:[path.join(__dirname,'src/main.js')],bundle:true,format:'iife',target:['es2020'],outfile:path.join(__dirname,'dist/adventure.js'),minify:true,legalComments:'eof',logLevel:'info'});
