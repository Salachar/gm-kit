const AudioPlayer = require('./player');
const AudioData = require('./data');

const {
    createElement,
    cacheElements
} = Lib.helpers;

class AudioManager {
    constructor () {
        cacheElements(this, [
            'audio_files',
            'search_input',
            'tracks_body',
            'search_body',
            'previous_body',
            'clear_previous'
        ]);

        this.data = new AudioData({
            parent: this
        });
        this.player = new AudioPlayer({
            parent: this
        });

        this.current_node = null;

        this.setEvents();
    }

    setEvents () {
        this.el_clear_previous.addEventListener('click', (e) => {
            this.el_previous_body.innerHTML = '';
            this.data.previous = {};
            this.data.save();
        });

        this.el_search_input.addEventListener('keyup', (e) => {
            let search = e.currentTarget.value;
            if (search.length < 2) {
                this.el_search_body.innerHTML = '';
                return;
            }

            let search_split = search.split(' ');
            let matches = [];

            for (let t in this.data.tracks) {
                const track = this.data.tracks[t];

                if (track.source.toLowerCase().indexOf(search) !== -1) {
                    matches.push(track);
                    continue;
                }

                let super_tag = track.tags.join('_').toLowerCase();
                let match = true;
                for (let s = 0; s < search_split.length; ++s) {
                    if (super_tag.indexOf(search_split[s]) === -1) {
                        match = false;
                        break;
                    }
                }

                if (match) matches.push(track);
            }
            this.generateSearchResults(matches);
        });
    }

    generateSearchResults (matches) {
        this.el_search_body.innerHTML = '';
        matches.forEach((match) => {
            this.createAudioTrackNode({
                track: match,
                parent: this.el_search_body
            });
        });
    }

    addToPrevious (opts = {}) {
        if (!opts.initial) {
            if (this.data.previous[opts.key]) return;
            this.data.previous[opts.key] = true;
            this.data.save();
        }
        this.createAudioTrackNode({
            track: this.data.tracks[opts.key],
            parent: this.el_previous_body
        });
    }

    createAudioTrackNode (opts = {}) {
        if (!opts.parent || !opts.track) {
            console.error('Missing info for adding track node');
            return;
        }

        let el_new_audio_file = createElement('div', 'audio_file', {
            html: opts.track.name,
            dataset: {
                tag: opts.tag,
                key: opts.track.key
            },
            events: {
                click: (e) => {
                    if (e.defaultPrevented) return;
                    if (this.current_node) this.current_node.classList.remove('selected');
                    this.current_node = el_new_audio_file;
                    this.current_node.classList.add('selected');
                    this.player.start(opts.track);
                    this.addToPrevious({
                        key: opts.track.key
                    });
                }
            },
            addTo: opts.parent
        });

        // All tags created during the initial building of the list
        // are removable
        this.data.tracks[opts.track.key].tags.forEach((tag) => {
            this.addTag({
                tag: tag,
                parent_node: el_new_audio_file,
                save: false,
                removable: opts.initial
            });
        });

        return el_new_audio_file;
    }

    clearTracks () {
        this.el_tracks_body.innerHTML = '';
    }

    clearSearch () {
        this.el_search_body.innerHTML = '';
    }

    clearPrevious () {
        this.el_previous_body.innerHTML = '';
        // this.data.previous = {};
    }

    clearAll () {
        this.clearTracks();
        this.clearSearch();
        this.clearPrevious();
    }

    buildAudioList (audio_files) {
        this.clearAll();

        let parent_node = this.el_tracks_body;
        Object.keys(audio_files).forEach((key) => {
            let override_section = null;
            if (key === 'files') {
                override_section = {
                    type: 'directory',
                    files: audio_files[key],
                    name: 'Tracks'
                };
            };
            this.createTrackSection({
                initial: true,
                section: override_section || audio_files[key],
                parent_node: parent_node
            });
        });

        Object.keys(this.data.previous).forEach((previous_key) => {
            this.addToPrevious({
                key: previous_key,
                initial: true
            });
        });
    }

    createTrackSection (opts = {}) {
        let el_new_section = createElement('div', 'audio_file_section');
        // Create the section title element
        createElement('div', 'audio_file_section_title', {
            html: opts.section.name,
            events: {
                click: (e) => {
                    el_new_section_body.classList.toggle('collapse');
                    if (el_new_section_body.classList.contains('collapse')) {
                        this.data.collapse[opts.section.name] = true;
                    } else {
                        this.data.collapse[opts.section.name] = false;
                    }
                    this.data.save();
                }
            },
            addTo: el_new_section
        });

        let el_new_section_body_class = 'audio_file_section_body';
        if (this.data.collapse[opts.section.name]) {
            el_new_section_body_class += ' collapse';
        }
        let el_new_section_body = createElement('div', el_new_section_body_class, {
            addTo: el_new_section
        });

        // If there are section files I need to add nodes to represent
        // the tracks that can be played
        if (opts.section.files) {
            Object.keys(opts.section.files).forEach((key) => {
                this.createTrack({
                    initial: opts.initial || false,
                    track: opts.section.files[key],
                    parent_node: el_new_section_body
                });
            });
        }

        // Check for any sub-sections and repeat the above until
        // the end of the list
        Object.keys(opts.section).forEach((key) => {
            if (typeof opts.section[key] === 'object' && key !== 'files') {
                this.createTrackSection({
                    section: opts.section[key],
                    parent_node: el_new_section_body
                });
            }
        });

        opts.parent_node.appendChild(el_new_section);
    }

    createTrack (opts = {}) {
        const track = opts.track;

        this.data.add(track);

        let el_new_audio_file = this.createAudioTrackNode({
            initial: opts.initial || false,
            parent: opts.parent_node,
            track: this.data.tracks[track.key]
        });

        createElement('input', 'audio_file_tag_input', {
            addTo: el_new_audio_file,
            events: {
                click: (e) => {
                    e.preventDefault();
                    return false;
                },
                keydown: (e) => {
                    if (e.code !== 'Enter') return;
                    let tag = e.currentTarget.value.trim();
                    if (!tag || tag === '') return;
                    this.data.tracks[track.key].tags.push(tag);
                    this.addTag({
                        tag: tag,
                        parent_node: el_new_audio_file,
                        save: true,
                        removable: true
                    });
                    e.currentTarget.value = '';
                }
            }
        });
    }

    addTag (opts = {}) {
        let tag_class = 'audio_file_tag';
        if (opts.removable) tag_class += ' removable';
        let new_tag = createElement('div', tag_class, {
            html: opts.tag,
            addTo: opts.parent_node
        });

        if (opts.removable) {
            createElement('div', 'audio_file_tag_remove', {
                addTo: new_tag,
                dataset: {
                    tag: opts.tag,
                    key: opts.parent_node.dataset.key
                },
                events: {
                    click: (e) => {
                        e.preventDefault();
                        const key = e.currentTarget.dataset.key;
                        if (!key) {
                            console.error('There was no parent key found for this tag');
                            return;
                        }
                        const new_tags = this.data.tracks[key].tags.filter((curr_tag) => {
                            return curr_tag !== e.currentTarget.dataset.tag;
                        });
                        this.data.tracks[key].tags = new_tags;
                        e.currentTarget.parentElement.remove();
                        this.data.save();
                    }
                }
            });
        }
        if (opts.save) {
            this.data.save();
        }
    }
}

module.exports = AudioManager;
