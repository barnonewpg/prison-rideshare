import BufferedProxy from 'prison-rideshare-ui/utils/buffered-proxy';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';

module('Unit | Utility | buffered proxy', function () {
  test('it buffers changes until they are applied', function (assert) {
    const content = EmberObject.create({ name: 'Jorts' });
    const proxy = BufferedProxy.create({ content });

    assert.false(proxy.hasBufferedChanges);

    proxy.set('name', 'Jean');

    assert.strictEqual(proxy.get('name'), 'Jean');
    assert.strictEqual(content.name, 'Jorts');
    assert.true(proxy.hasBufferedChanges);
    assert.true(proxy.hasChanged('name'));

    proxy.applyBufferedChanges();

    assert.strictEqual(content.name, 'Jean');
    assert.false(proxy.hasBufferedChanges);
  });

  test('it discards changes', function (assert) {
    const content = EmberObject.create({ name: 'Jorts' });
    const proxy = BufferedProxy.create({ content });

    proxy.set('name', 'Jean');
    proxy.discardChanges();

    assert.strictEqual(proxy.get('name'), 'Jorts');
    assert.false(proxy.hasChanges);
  });

  test('setting a value back to the original clears the change', function (assert) {
    const content = EmberObject.create({ name: 'Jorts' });
    const proxy = BufferedProxy.create({ content });

    proxy.set('name', 'Jean');
    proxy.set('name', 'Jorts');

    assert.false(proxy.hasBufferedChanges);
  });

  test('it applies only the given keys', function (assert) {
    const content = EmberObject.create({ name: 'Jorts', colour: 'orange' });
    const proxy = BufferedProxy.create({ content });

    proxy.set('name', 'Jean');
    proxy.set('colour', 'tortoiseshell');
    proxy.applyBufferedChanges(['name']);

    assert.strictEqual(content.name, 'Jean');
    assert.strictEqual(content.colour, 'orange');
    assert.true(proxy.hasBufferedChanges);
  });

  test('properties passed to create are defined, not buffered', function (assert) {
    const content = EmberObject.create({ name: 'Jorts' });
    const proxy = BufferedProxy.create({ content, extra: 'yes' });

    assert.strictEqual(proxy.get('extra'), 'yes');
    assert.false(proxy.hasBufferedChanges);
    assert.strictEqual(content.extra, undefined);
  });
});
