class Note {
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

    return this.render();
  }

  render () {
    const {
      text = "",
      identifiers = "",
    } = this.props;

    this.node = Lib.dom.generate(
      [`div ${identifiers} .note HTML=${text}`],
    );

    return this.node;
  }
}

module.exports = Note;
