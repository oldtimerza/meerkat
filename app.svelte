<script>
    const Mousetrap = require('./mousetrap.min.js');

    //handle the VIM style modes
    const modes = {
        NAVIGATE: "NAVIGATE",
        EDIT: "EDIT",
        INSERT: "INSERT"
    }

    let currentMode = modes.NAVIGATE

    let insertText = ""

    let todos = [{id: 0, done: false, text: "Get meerkat working"}]

    function changeMode(newMode){
        currentMode = newMode
    }

    function determineActionFromMode(doInNav, doInEdit, doInInsert){
        if(currentMode == modes.NAVIGATE){
            doInNav()
        }

        if(currentMode == modes.EDIT){
            doInEdit()
        }

        if(currentMode == modes.INSERT){
            doInInsert()
        }
    }

    //actions
    function enterInsertMode(){
        
        changeMode(modes.INSERT)
    }

    function insertTodo(){
        todos = [...todos, {id: 0, done: false, text: insertText}]
        insertText = ""
        changeMode(modes.NAVIGATE)
    }


    //key bindings
    Mousetrap.bind('i', 
    determineActionFromMode(
        () => changeMode(modes.INSERT),
        () => {},
        () => {}
    )
   );
</script>

<h1>Welcome to meerkat - the simple VIM inspired todo maker</h1>

<input type="text" bind:value={insertText} onsubmit={insertTodo}/>

{#each todos as todo}
    <li>
        <input class="toggle" type="checkbox" checked="{todo.done}" />
        <p>{todo.text}</p>
    </li>
{/each}