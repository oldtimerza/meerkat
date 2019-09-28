<script>
    const Mousetrap = require('./mousetrap.min.js');

    //state
    const modes = {
        NAVIGATE: "NAVIGATE",
        EDIT: "EDIT",
        INSERT: "INSERT"
    }

    let currentMode = modes.NAVIGATE

    let insertText = ""

    let ref

    let lastId = 0;

    const createTodo = (text, done = false) => ({id: ++lastId, text, done});

    let todos = [createTodo("Get stuff done")]

    function determineActionFromMode({doInNav, doInEdit, doInInsert}){
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

    function changeMode(newMode){
        currentMode = newMode
    }

    function enterInsertMode(){
        changeMode(modes.INSERT)
        ref.focus()
        insertText = ""
    }

    function enterNavigationMode(){
        changeMode(modes.NAVIGATE)
        ref.blur()
        insertText = ""
    }

    function insertTodo(){
        todos = [...todos, createTodo(insertText)]
        insertText = ""
        enterNavigationMode()
    }

    //key bindings

    Mousetrap.bind('i', 
        () => determineActionFromMode(
            {
                doInNav: enterInsertMode,
                doInInsert:() => {},
                doInEdit: () => {}
            }
        )
    );

    Mousetrap.bind('esc',
        () => determineActionFromMode(
            {
                doInNav: () => {},
                doInInsert: enterNavigationMode,
                doInEdit: enterNavigationMode
            }
        ),
        'keyup'
    )
</script>

<h1>Welcome to meerkat - the simple VIM inspired todo maker</h1>

<form on:submit|preventDefault={insertTodo}>
  <input type="text" bind:value={insertText} bind:this={ref} class="mousetrap"/>
  <button type="submit">Add</button>
</form>

{#each todos as todo}
    <li>
        <p>{todo.text}</p>
    </li>
{/each}