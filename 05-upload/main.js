var pyodide;
var pkg;
function update_status(x) {
    console.log(x);
    document.getElementById("status").innerText = x;
}
function getCode() {
    return document.getElementById("pythonCode").value;
}
async function evalIt(){
    update_status("Evaling Code");
    let res = await pyodide.runPythonAsync(getCode());
    console.log( res );
    update_status( res );
}
function uploadListener(e) {
    const file = e.target.files[0];
    console.log(file);
    loadFile(file);
}
function loadFile(file) {
    var reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = evt => { 
        content = evt.target.result; 
        update_status("Bytes written: "+pkg.load_file_from_browser("/pic.png"));
    }
}

async function loadPythonFiles() {
    await pyodide.runPythonAsync(`
        from pyodide.http import pyfetch
        response = await pyfetch("./script.py")
        with open("script.py", "wb") as f:
            f.write(await response.bytes())
`
    )
    update_status("Loading python script ");
    pkg = pyodide.pyimport("script");
    update_status("Installing Python modules");
    await pkg.install_deps();
    update_status("Python Modules Installed: READY TO GO!");
}

window.addEventListener("load", function() {
    update_status("Loading Pyodide, please wait");
    document.getElementById("upload").onchange = uploadListener;
    loadPyodide().then( p => {
        pyodide = p;
        update_status("Pyodide loaded. Loading Micropip.");
        pyodide.loadPackage(["micropip"]).then( () => {
            update_status("Micropip is loaded! Eval away!");
            return loadPythonFiles();
        });
    });
}, false);
