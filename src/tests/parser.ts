import { getFileData } from "../lib/utils/utils";
import { Parser } from "../parser";
export default (): boolean => {
    try {
    console.log("starting test with module: parser");
    console.log("starting parser instance")
    const parser = Parser.getInstance(getFileData("./src/tests/testData.mdp"));
    console.log("starting parsing");
    parser.parseData();
    
    console.log("returning test value");
    return parser.parsed == expectedOutput;
    }catch (e) {
        console.log(e);
        return false;
    };
}   //TODO fix it

const expectedOutput = {
    variables: [
      { value: 'main', type: 'name', name: '_data' },
      { value: '9', type: 'pack_format', name: '_data' },
      {
        value: 'ahah funny go brrrrrrr',
        type: 'description',
        name: '_data'
      },
      { value: 'amogus', type: 'string', name: 'amogus::funny' },
      {
        value: 'amogus',
        type: 'string',
        name: 'too::much::gaming::local'
      },
      {
        value: 'ahahahahahahahha\n' +
          '}\n' +
          '\n' +
          'var minecraft/tags/functions/load.json: file = {\n' +
          '    "values": [\n' +
          '        "main:main/amogus"\n' +
          '    ]\n' +
          '}',
        type: 'string',
        name: 'syntaxError'
      }
    ],
    functions: [
      {
        name: 'amogus',
        args: {},
        body: '\n' +
          '    setblock 0 0 0 minecraft:bedrock\n' +
          '    data modify storage main amogus.funny set value amogus\n',
        filePath: 'amogus',
        transpiled: ''
      },
      {
        name: 'too::much::gaming',
        args: {},
        body: '\n' +
          '    data modify storage main too.much.gaming.local set value amogus\n' +
          '\n' +
          '    var syntaxError: string = ahahahahahahahha\n',
        filePath: 'too/much/gaming',
        transpiled: ''
      }
    ],
    datapackData: {
      name: 'main',
      pack_format: 9,
      description: 'ahah funny go brrrrrrr'
    }
  }