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
        activeTodoIndex: 0,
        percentComplete: 0
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

    $: {
        const completeTodos = state.todos.filter(todo => todo.done)
        state.percentComplete = (completeTodos.length / state.todos.length)*100
    }

    //actions
    const createTodo = (text, done = false) => ({text, done, created: new Date()});

    function changeMode(newMode){
        currentMode = newMode
    }

    function enterInsertMode(event){
        ref.focus()
    }

    function onFocus(){
        insertText = ""
        changeMode(modes.INSERT)
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
        //neat trick to prevent negative modulo resuls
        state.activeTodoIndex = ((state.activeTodoIndex - 1 % state.todos.length) + state.todos.length) % (state.todos.length)
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
        ),
        'keyup'
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
        background-color: #22096A;
        height: 100%;
    }

    .custom-form {
        margin-bottom: 0px !important;
    }

    .custom-row {
        height: 54px;
    }

    .align-left {
        position: absolute;
        left: 0;
    }

    .full-width {
        width: 640px;
        max-width: 640px;
        margin: 0px;
        padding: 0px;
    }

    .checkbox-container {
        padding: 0px;
    }

    .custom-check {
        height: 54px;
        width: 54px;
        left: 0px;
        padding: 0px;
        font-size: 24px;
        text-align: center;
        vertical-align: middle;
        line-height: 48px;     
    }

    .description {
        color: white;
        font-size: 16px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        padding-left: 2.5%;
        vertical-align: middle;
        line-height: 48px;     
    }

    .done {
        background: #00AF64;
    }

    .not-done{
        background: #EA0037;
    }

    .active {
        background: #3C13AF;
    }

    .remove-radius {
        border-radius: 0 !important;
    }

    .progress-bar {
        width: 100%;
        background-color: #EB355F;
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, .2);
    }
    
    .progress-bar-fill {
        display: block;
        height: 22px;
        background-color: #28B478;
        
        transition: width 500ms ease-in-out;
    }
</style>

<div class="align-left full-width background">
    <form on:submit|preventDefault={insertTodo}>
        <div class="custom-form input-group mb-3">
            <input type="text" class=" mousetrap form-control remove-radius" bind:value={insertText} bind:this={ref} on:focus={onFocus}/>
            <button type="submit" class="btn btn-primary remove-radius">Add</button>
        </div>
    </form>
    <div class="progress-bar">
        <span class="progress-bar-fill" style="width: {state.percentComplete}%;"></span>
    </div>
    {#if state.loading}
        <p>Loading todos</p>
    {:else}
    <div class="container-fluid">
        {#each state.todos as todo, index}
        <div class="custom-row row {index == state.activeTodoIndex?  ' active' : ''}">
            <div class= "checkbox-container col-2">
                {#if todo.done}
                    <div class="custom-check done">
                        ✔️
                    </div>
                {:else}
                    <div class="custom-check not-done">
                        ❌
                    </div>
                {/if}
            </div>
            <div class="description col-10">
                {todo.text}
            </div>
        </div>
        {/each}
    </div>
    {/if}
</div>