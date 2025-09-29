const child_process = require('child_process');
const os = require('os');

let command;

if (os.platform() === 'win32') {
    // Windows
    command = path.join(__dirname, 'theia_install.bat');
} else {
    // Linux (or other Unix-like)
    command = path.join(__dirname, 'theia_install.sh');
}

const result = child_process.spawnSync(command, { stdio: 'inherit' });

if (result.error) {
    console.error(`Error executing command: ${result.error.message}`);
    process.exit(1);
}
if (result.stderr) {
    console.error(`stderr: ${result.stderr}`);
}
console.log(`stdout: ${result.stdout}`);

process.exit(result.status);
