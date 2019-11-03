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

    let insertText = ""

    let ref

    let state = {
        currentMode: modes.NAVIGATE,
        loading: true,
        todos: [],
        activeTodoIndex: 0,
        percentComplete: 0,
    }

    function determineActionFromMode({doInNav, doInEdit, doInInsert}){
        if(state.currentMode == modes.NAVIGATE){
            doInNav()
        }

        if(state.currentMode == modes.EDIT){
            doInEdit()
        }

        if(state.currentMode == modes.INSERT){
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
        state.currentMode = newMode
    }

    function toggleInputForm(){
        return state.currentMode == modes.INSERT
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
        background-color: #292A2B;
        height: 100%;
        overflow: auto;
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
        background: #19F9D8;
    }

    .not-done{
        background: #FF2C6D;
    }

    .active {
        background: #7d8082;
    }

    .active .description{
        color: #FFB86C;
    }

    .remove-radius {
        border-radius: 0 !important;
    }

    .progress-bar {
        width: 100%;
        background-color: #e60045;
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, .2);
    }
    
    .progress-bar-fill {
        display: block;
        height: 22px;
        background-color: #05c7aa;
        
        transition: width 500ms ease-in-out;
    }

    .hidden-form {
        opacity: 0;
        height: 0px;
    }

    .visible-form {
        opacity: 100;
    }
</style>

<div class="align-left full-width background">
    <div class="progress-bar" id="progress-bar">
        <span class="progress-bar-fill" id="progress-bar-fill" style="width: {state.percentComplete}%;"></span>
    </div>
    <form class="{state.currentMode == modes.NAVIGATE? 'hidden-form' : 'visible-form'}" on:submit|preventDefault={insertTodo}>
        <div class="custom-form input-group mb-3" >
            <input type="text" class=" mousetrap form-control remove-radius" id="todo-input" bind:value={insertText} bind:this={ref} on:focus={onFocus}/>
            <button type="submit" class="btn btn-primary remove-radius" id="todo-add-button">Add</button>
        </div>
    </form>
    {#if state.loading}
        <p>...</p>
    {:else}
    <div class="container-fluid">
        {#each state.todos as todo, index}
        <div class="custom-row row {index == state.activeTodoIndex?  ' active' : ''}" id="todo-{index}">
            <div class= "checkbox-container col-2">
                {#if todo.done}
                    <div class="custom-check done" id="todo-done-{index}">
                        ✔️
                    </div>
                {:else}
                    <div class="custom-check not-done" id="todo-undone-{index}">
                        ❌
                    </div>
                {/if}
            </div>
            <div class="description col-10" id="todo-descr-{index}">
                {todo.text}
            </div>
        </div>
        {/each}
    </div>
    {/if}
</div>