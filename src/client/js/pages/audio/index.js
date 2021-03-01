const AudioPlayer = require('./player');
const AudioData = require('./data');

const Container = require('../base');
class AudioContainer extends Container {
    constructor (opts = {}) {
        super({
            ...opts,
            type: 'audio',
        });

        this.data = new AudioData({
            parent: this
        });
        this.player = new AudioPlayer({
            parent: this
        });

        this.render();
    }

    onMount () {
        this.setIPCEvents();
        if (CONFIG.audio_directory) {
            IPC.send('audio_page_loaded');
        }
    }

    setIPCEvents () {
        IPC.on('audio_directory_chosen', (e) => {
            IPC.send('audio_page_loaded');
        });
        // Audio Data is loaded first, then the files
        IPC.on('audio_json_loaded', (e, data_json) => {
            this.data.set(data_json);
        });
        // Files are loaded second
        IPC.on('audio_list_loaded', (e, files_json) => {
            this.refs.no_audio_screen.classList.add('hidden');
            this.buildAudioList(files_json);
        });
        IPC.on('audio_list_error', (e) => {
            this.refs.no_audio_screen.classList.remove('hidden');
        });
    }

    clearTracks () {
        this.refs.tracks_body.innerHTML = '';
    }

    clearSearch () {
        this.refs.search_body.innerHTML = '';
    }

    clearPrevious () {
        this.refs.previous_body.innerHTML = '';
    }

    clearAll () {
        this.clearTracks();
        this.clearSearch();
        this.clearPrevious();
    }

    onSearch (e) {
        let search_string = e.currentTarget.value;
        if (search_string.length < 2) {
            this.refs.search_body.innerHTML = '';
            return;
        }


        let matches = [];

        for (let t in this.data.tracks) {
            const track = this.data.tracks[t];
            // Dont include the track if the directory doesnt match
            // Audio json can end up having data from multiple audio directories
            if (track.source.indexOf(CONFIG.audio_directory) === -1) continue;

            // Check the source
            if (track.source.toLowerCase().indexOf(search_string) !== -1) {
                matches.push(track);
                continue;
            }
            // Check the name
            if (track.name.toLowerCase().indexOf(search_string) !== -1) {
                matches.push(track);
                continue;
            }

            let super_tag = track.tags.join('_').toLowerCase();
            let match = true;
            let search_split = search_string.split(' ');
            for (let s = 0; s < search_split.length; ++s) {
                if (super_tag.indexOf(search_split[s]) === -1) {
                    match = false;
                    break;
                }
            }

            if (match) matches.push(track);
        }

        this.refs.search_body.innerHTML = '';

        matches.forEach((match) => {
            this.createAudioTrackNode({
                track: match,
                parent: this.refs.search_body
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
            parent: this.refs.previous_body
        });
    }

    buildAudioList (audio_files) {
        this.clearAll();

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
                parent_node: this.refs.tracks_body
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
        Lib.dom.generate(['div .audio_file_section', [
            [`div .audio_file_section_title HTML=${opts.section.name}`, {
                // click: (e) => {
                //     el_new_section_body.classList.toggle('collapse');
                //     if (el_new_section_body.classList.contains('collapse')) {
                //         this.data.collapse[opts.section.name] = true;
                //     } else {
                //         this.data.collapse[opts.section.name] = false;
                //     }
                //     this.data.save();
                // }
            }],
            [`div .audio_file_section_body ${this.data.collapse[opts.section.name] ? '.collapse' : ''}`, {
                oncreate: (node) => {
                    // If there are section files I need to add nodes to represent
                    // the tracks that can be played
                    if (opts.section.files) {
                        Object.keys(opts.section.files).forEach((key) => {
                            const track = opts.section.files[key];
                            this.data.add(track);
                            let el_new_audio_file = this.createAudioTrackNode({
                                initial: opts.initial || false,
                                parent: opts.parent_node,
                                track: this.data.tracks[track.key]
                            });

                            Lib.dom.generate(['input .audio_file_tag_input', {
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
                            }], null, el_new_audio_file);
                        });
                    }

                    // Check for any sub-sections and repeat the above until
                    // the end of the list
                    Object.keys(opts.section).forEach((key) => {
                        if (typeof opts.section[key] === 'object' && key !== 'files') {
                            this.createTrackSection({
                                section: opts.section[key],
                                parent_node: node
                            });
                        }
                    });
                }
            }],
        ]], null, opts.parent_node);
    }

    createAudioTrackNode (opts = {}) {
        if (!opts.parent || !opts.track) {
            console.error('Missing info for adding track node');
            return;
        }

        return Lib.dom.generate([`div .audio_file HTML=${opts.track.name}`, {
            dataset: {
                tag: opts.tag,
                key: opts.track.key
            },
            click: (e) => {
                if (e.defaultPrevented) return;
                if (this.current_node) this.current_node.classList.remove('selected');
                this.current_node = e.target;
                this.current_node.classList.add('selected');
                this.player.start(opts.track);
                this.addToPrevious({
                    key: opts.track.key
                });
            },
            oncreate: (node) => {
                this.data.tracks[opts.track.key].tags.forEach((tag) => {
                    this.addTag({
                        tag: tag,
                        parent_node: node,
                        save: false,
                        removable: opts.initial
                    });
                });
            },
        }], null, opts.parent);
    }

    addTag (opts = {}) {
        let tag_class = '.audio_file_tag';
        if (opts.removable) tag_class += ' .removable';

        Lib.dom.generate([`div ${tag_class} HTML=${opts.tag}`, [
            opts.removable && ['div .audio_file_tag_remove', {
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
            }]
        ]], null, opts.parent_node);

        if (opts.save) this.data.save();
    }

    render () {
        Lib.dom.generate(['div .page', [
            ['div .container_header', [
                this.player.render(),
            ]],
            ['div .container_body', [
                ['div #no_audio_screen .help_screen', [
                    ['div .help_screen_action', {
                        click: (e) => IPC.send('choose_audio_directory'),
                    }, [
                        ['div .help_screen_main_text HTML=CLICK TO CHOOSE AUDIO FOLDER'],
                    ]]
                ]],

                ['div .tracks_section .section', [
                    ['div .section_title HTML=tracks'],
                    ['div #tracks_body .section_body'],
                ]],

                ['div .search_section .section', [
                    ['div .section_title HTML=search'],
                    ['input .search_input .text_input', {
                        placeholder: 'ENTER TRACK/TAG/FOLDER',
                        onchange: (e) => this.onSearch(e)
                    }],
                    ['div #search_body .section_body'],
                ]],

                ['div #previous_section .section', [
                    ['div .section_title', [
                        ['span HTML=previously played'],
                        ['div #clear_previous HTML=CLEAR', {
                            click: (e) => {
                                this.refs.previous_body.innerHTML = '';
                                this.data.previous = {};
                                this.data.save();
                            }
                        }],
                    ]],
                    ['div #previous_body .section_body'],
                ]],
            ]]
        ]], this, this.node);

        this.onMount();
    }
};

module.exports = AudioContainer;
