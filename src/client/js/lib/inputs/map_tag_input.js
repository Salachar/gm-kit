class MapTagInput {
  constructor (identifiers = '', props = {}) {
    if (typeof identifiers === 'object') {
      props = identifiers;
      identifiers = '';
    }

    let id = null;
    identifiers.split(' ').forEach((identifier) => {
      if (identifier[0] === '#') {
        id = identifier.replace('#','');
      }
    });

    if (props.parent && id) {
      props.parent.refs = props.parent.refs || {};
      props.parent.refs[id] = this;
    }

    this.props = {
      identifiers: identifiers || '',
      ...props,
    };

    const {
      map = {},
      tags = {},
    } = this.props;

    this.map = map;
    this.tags = [];
    try {
      this.tags = tags[map.name] || [];
      if (!this.tags) this.tags = [];
    } catch (e) {
      console.log(e);
    }

    this.node_tags_list = null;

    return this.render();
  }

  save (tag_data) {
    IPC.send('save_map_tag', tag_data);
  }

  remove (tag_data) {
    IPC.send('remove_map_tag', tag_data);
  }

  update (map, map_tags) {
    console.log(3);
    this.node_tags_list.innerHTML = "";
    const tags = map_tags[map.name] || [];
    this.map = map;
    this.tags = tags;
    (tags || []).forEach((tag) => {
      this.addTag({
        tag: tag,
        parent_node: this.node_tags_list,
        save: false,
        key: map.name,
      });
    });
  }

  addTag ({
    tag = "",
    parent_node = null,
    save = false,
    removable = true,
    key = "",
  }) {
    let tag_class = '.map_tag';
    if (removable) tag_class += ' .removable';
    if (save) this.save({ key, tag });

    return Lib.dom.generate([`div ${tag_class} HTML=${tag}`, [
      removable && ['div .map_tag_remove', {
        dataset: { key, tag },
        click: (e, node) => {
          e.preventDefault();
          const d_key = node.dataset.key;
          const d_tag = node.dataset.tag;
          if (!d_key) {
            console.warn('There was no parent key found for this tag');
            return;
          }
          node.parentElement.remove();
          this.remove({
            key: d_key,
            tag: d_tag,
          });
        }
      }]
    ]], null, parent_node);
  }

  render () {
    const { identifiers } = this.props;

    this.node = Lib.dom.generate(
      [`div ${identifiers} .map_tag_container`, [
        ['div .map_tag_list', {
          oncreate: (node) => {
            this.node_tags_list = node;
            this.tags.forEach((tag) => {
              this.addTag({
                tag: tag,
                parent_node: node,
                save: false,
                key: this.map.name,
              });
            });
          },
        }],
        ['input .map_tag_input', {
          click: (e) => {
            e.preventDefault();
            return false;
          },
          keydown: (e, node) => {
            if (e.code !== 'Enter') return;
            let tag = e.currentTarget.value.trim();
            if (!tag || tag === '') return;
            this.addTag({
              tag: tag,
              parent_node: node.previousElementSibling,
              save: true,
              key: this.map.name,
            });
            e.currentTarget.value = '';
          }
        }],
      ]],
    );

    return this.node;
  }
}

module.exports = MapTagInput;
