import { createFilter, dataToEsm } from '@rollup/pluginutils';
import temp from 'temp';
import { exec } from 'child_process';
import fs from 'fs';

const ink = (options = {}) => {
  const filter = createFilter(options.include, options.exclude);
  const indent = 'indent' in options ? options.indent : '\t';
  const cmd = 'command' in options ? options.command : 'inklecate';

  return {
    name: 'ink',
    async transform(content, filePath) {
      if (filePath.slice(-4) !== '.ink' || !filter(filePath))
        return null;

      return new Promise((resolve, reject) => {
        temp.track();
        // Temp file to write the result JSON
        const tempFile = temp.path();
        exec(
          `${cmd} -c -j -o ${tempFile} ${filePath}`,
          (err, stdout) => {
            if (err) {
              if (err.code !== 1) {
                this.warn({ message: err });
                resolve(null);
                return;
              }
            }
            // Extract result from command output
            const lines = stdout
              .trim()
              .replace(/}{/g, '}\n{')
              .split('\n')
              .filter((line) => line)
              .map((line) => JSON.parse(line));
            const success = lines[0]['compile-success'];
            const issues = lines[1]['issues'];

            if (!success) {
              issues.forEach((issue) => {
                this.warn({
                  message: issue,
                  id: filePath,
                });
              });
              resolve(null);
            } else {
              if (issues) {
                issues.forEach((issue) => {
                  this.warn({ message: issue });
                });
              }
              fs.readFile(tempFile, (err, data) => {
                if (err) {
                  this.err('Failed to parse INK file.');
                  resolve(null);
                  return;
                }
                try {
                  const parsed = JSON.parse(data.toString().trim());
                  resolve({
                    code: dataToEsm(parsed, {
                      preferConst: options.preferConst,
                      compact: options.compact,
                      namedExports: options.namedExports,
                      indent,
                    }),
                    map: { mappings: '' },
                  });
                } catch (err) {
                  const message =
                    'Could not parse generated JSON file from Ink file.';
                  this.warn({ message, id: filePath });
                  resolve(null);
                }
              });
            }
          },
        );
      });
    },
  };
};

export default ink;
