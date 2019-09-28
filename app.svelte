<script>
    const { ipcRenderer } = window.require('electron')
    const Mousetrap = require('./mousetrap.min.js');

    //setup
    ipcRenderer.send('request-todos')

    ipcRenderer.on('todos', (event, arg) => {
        state.todos = arg
        state.loading = false
    })

    //state
    const modes = {
        NAVIGATE: "NAVIGATE",
        EDIT: "EDIT",
        INSERT: "INSERT"
    }

    let currentMode = modes.NAVIGATE

    let insertText = ""

    let ref

    let state = {
        loading: true,
        todos: [],
        activeTodoIndex: 0
    }

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
    const createTodo = (text, done = false) => ({text, done});

    function changeMode(newMode){
        currentMode = newMode
    }

    function enterInsertMode(event){
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
        ipcRenderer.send('add-todo', createTodo(insertText))
        insertText = ""
        enterNavigationMode()
    }

    function removeTodo(){
        if(state.todos[state.activeTodoIndex]){
            const index = state.activeTodoIndex
            state.activeTodoIndex = 0
            ipcRenderer.send('remove-todo', state.todos[index])
        }
    }

    function scrollNextTodo(){
        state.activeTodoIndex = (state.activeTodoIndex + 1) % (state.todos.length)
    }

    function scrollPrevTodo(){
        state.activeTodoIndex = (state.activeTodoIndex - 1) % (state.todos.length)
    }

    function toggleActiveTodo(){
        if(state.todos[state.activeTodoIndex]){
            state.todos[state.activeTodoIndex].done = !state.todos[state.activeTodoIndex].done 
            ipcRenderer.send('update-todo', state.todos[state.activeTodoIndex])
        }
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

    Mousetrap.bind('j', 
        () => determineActionFromMode(
            {
                doInNav: scrollNextTodo,
                doInInsert:() => {},
                doInEdit: () => {}
            }
        )
    );

    Mousetrap.bind('k', 
        () => determineActionFromMode(
            {
                doInNav: scrollPrevTodo,
                doInInsert:() => {},
                doInEdit: () => {}
            }
        )
    );

    Mousetrap.bind('d d', 
        () => determineActionFromMode(
            {
                doInNav: removeTodo,
                doInInsert:() => {},
                doInEdit: () => {}
            }
        )
    );

    Mousetrap.bind('space', 
        () => determineActionFromMode(
            {
                doInNav: toggleActiveTodo,
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

<style>
    .background {
        background-color: #7f8ca1
    }
</style>

<div class="background">
    <h1>Welcome to meerkat - the simple VIM inspired todo maker</h1>

    <form on:submit|preventDefault={insertTodo} class="form-inline">
        <div class="form-group mb-2"></div>
            <input type="text" bind:value={insertText} bind:this={ref} class="mousetrap"/>
            <button type="submit">Add</button>
        <div>
    </form>

    {#if state.loading}
        <p>Loading todos</p>
    {:else}
    <ul class="list-group">
        {#each state.todos as todo, index}
        <li class="list-group-item {index == state.activeTodoIndex?  ' active' : ''}">
            {#if todo.done}
                <span class="badge badge-success">✔️</span>
            {:else}
                <span class="badge badge-danger">❌</span>
            {/if}
            <label for={todo.id}>{todo.text}</label> 
        </li>
        {/each}
    </ul>
    {/if}
</div>