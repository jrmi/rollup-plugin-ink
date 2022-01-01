import ink from '../rollup-plugin-ink';

const refOk = {
  code:
    'export var inkVersion = 20;\n' +
    'export var root = [\n' +
    '\t[\n' +
    '\t\t"^Hello world",\n' +
    '\t\t"\\n",\n' +
    '\t\t"done",\n' +
    '\t\t[\n' +
    '\t\t\t"done",\n' +
    '\t\t\t{\n' +
    '\t\t\t\t"#f": 5,\n' +
    '\t\t\t\t"#n": "g-0"\n' +
    '\t\t\t}\n' +
    '\t\t],\n' +
    '\t\tnull\n' +
    '\t],\n' +
    '\t"done",\n' +
    '\t{\n' +
    '\t\t"#f": 1\n' +
    '\t}\n' +
    '];\n' +
    'export var listDefs = {\n' +
    '};\n' +
    'export default {\n' +
    '\tinkVersion: inkVersion,\n' +
    '\troot: root,\n' +
    '\tlistDefs: listDefs\n' +
    '};\n',
  map: { mappings: '' },
};

describe('Transform to ES module', () => {
  test('should transform basic file', async () => {
    const inkPlugin = ink();

    const result = await inkPlugin.transform('', './tests/test.ink');
    expect(result.code).toBe(refOk.code);
  });

  test('should transform file with loose end', async () => {
    const inkPlugin = ink();

    inkPlugin.warn = jest.fn();

    const result = await inkPlugin.transform(
      '',
      './tests/test_loose.ink',
    );
    expect(inkPlugin.warn).toHaveBeenCalledWith({
      message:
        "WARNING: 'test_loose.ink' line 5: Apparent loose end exists where the " +
        "flow runs out. Do you need a '-> DONE' statement, choice or divert?",
    });
  });

  test('should transform file with loose end', async () => {
    const inkPlugin = ink();

    inkPlugin.warn = jest.fn();

    const result = await inkPlugin.transform(
      '',
      './tests/test_err.ink',
    );
    expect(result).toBe(null);
    expect(inkPlugin.warn).toHaveBeenCalledWith({
      id: './tests/test_err.ink',
      message:
        "ERROR: 'test_err.ink' line 2: Divert target not found: '-> DO'",
    });
  });
});
