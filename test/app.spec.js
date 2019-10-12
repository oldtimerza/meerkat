const { Application } = require('spectron');
const assert = require('assert');
const electronPath = require('electron');
const path = require('path');

describe('Application launch', function () {
  const timeout = 60000;
  const app = new Application({
    path: electronPath,
    args: [path.join(__dirname, '..')],
  });

  this.timeout(timeout);

  before(async () => app.start());

  after(async () => app.stop());

  it('should open the window', () => {
    app.client.waitUntilWindowLoaded()
      .getWindowCount()
      .then((count) => assert.equal(count, 1));
  });

  it('should create a todo item', async () => {
    await app.client.keys('i');
    const input = app.client.element('#todo-input');
    assert(input.hasFocus(), 'input should be in focus');
    const inputValue = 'test';
    await input.setValue(inputValue);
    await app.client.click('#todo-add-button');

    const todo = await app.client.waitForExist('#todo-0').element('#todo-0');
    assert.notEqual(todo.value, null, 'expected a todo to exist');

    const description = await app.client.getText('#todo-descr-0');
    assert.equal(description, inputValue, 'todo should have correct description');
  });
});
