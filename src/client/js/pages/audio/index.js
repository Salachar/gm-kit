const Container = require('../base');
// const AudioManager = require('./audio');
const AudioPlayer = require('./player');
const AudioData = require('./data');

const { ctwo } = Lib.dom;

class AudioContainer extends Container {
    constructor (opts = {}) {
        super({
            ...opts,
            type: 'audio',
            render: false,
        });

        // this.audio_manager = new AudioManager();
        this.data = new AudioData({
            parent: this
        });
        this.player = new AudioPlayer({
            parent: this
        });

        // this.setIPCEvents();

        // if (CONFIG.audio_directory) {
        //     IPC.send('audio_loaded');
        // }

        this.render();
    }

    onMount () {
        this.setIPCEvents();
        if (CONFIG.audio_directory) {
            IPC.send('audio_loaded');
        }
    }

    setIPCEvents () {
        IPC.on('audio_folder_chosen', (e) => {
            IPC.send('audio_loaded');
        });
        // Audio Data is loaded first, then the files
        IPC.on('data_loaded', (e, data_json) => {
            // this.audio_manager.data.set(data_json);
            this.data.set(data_json);
        });
        // Files are loaded second
        IPC.on('files_loaded', (e, files_json) => {
            console.log(1);
            this.refs.no_audio_screen.classList.add('hidden');
            // this.audio_manager.buildAudioList(files_json);
            this.buildAudioList(files_json);
        });
        IPC.on('audio_list_error', (e) => {
            this.refs.no_audio_screen.classList.remove('hidden');
        });
    }

    onSearch (search_string) {
        let search_string = e.currentTarget.value;
        if (search_string.length < 2) {
            this.refs.search_body.innerHTML = '';
            return;
        }

        let search_split = search_string.split(' ');
        let matches = [];

        for (let t in this.data.tracks) {
            const track = this.data.tracks[t];

            if (track.source.toLowerCase().indexOf(search_string) !== -1) {
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

        // this.generateSearchResults(matches);
        this.refs.search_body.innerHTML = '';
        console.log(2);
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
        console.log(this);
        this.createAudioTrackNode({
            track: this.data.tracks[opts.key],
            parent: this.refs.previous_body
        });
    }

    createAudioTrackNode (opts = {}) {
        if (!opts.parent || !opts.track) {
            console.log(opts);
            console.error('Missing info for adding track node');
            return;
        }

        return Lib.dom.ctwo(opts.parent, [`div .audio_file HTML=${opts.track.name}`, {
            dataset: {
                tag: opts.tag,
                key: opts.track.key
            },
            click: (e) => {
                if (e.defaultPrevented) return;
                if (this.current_node) this.current_node.classList.remove('selected');
                // this.current_node = el_new_audio_file;
                this.current_node = e.target;
                console.log(e);
                this.current_node.classList.add('selected');
                this.player.start(opts.track);
                this.addToPrevious({
                    key: opts.track.key
                });
            },
            oncreate: (node) => {
                console.log(this.data.tracks[opts.track.key]);
                this.data.tracks[opts.track.key].tags.forEach((tag) => {
                    this.addTag({
                        tag: tag,
                        parent_node: node,
                        save: false,
                        removable: opts.initial
                    });
                });
                // this.addTag({
                //     tag: tag,
                //     parent_node: node,
                //     save: false,
                //     removable: opts.initial
                // });
            },
        }]);

        // // All tags created during the initial building of the list
        // // are removable
        // this.data.tracks[opts.track.key].tags.forEach((tag) => {
        //     this.addTag({
        //         tag: tag,
        //         parent_node: el_new_audio_file,
        //         save: false,
        //         removable: opts.initial
        //     });
        // });

        // return el_new_audio_file;
    }

    clearTracks () {
        // this.el_tracks_body.innerHTML = '';
        document.getElementById('tracks_body').innerHTML = '';
    }

    clearSearch () {
        // this.el_search_body.innerHTML = '';
        document.getElementById('search_body').innerHTML = '';
    }

    clearPrevious () {
        // this.el_previous_body.innerHTML = '';
        document.getElementById('previous_body').innerHTML = '';
        // this.data.previous = {};
    }

    clearAll () {
        this.clearTracks();
        this.clearSearch();
        this.clearPrevious();
    }


    buildAudioList (audio_files) {
        console.log('build audio list');
        this.clearAll();

        // let parent_node = this.el_tracks_body;
        let parent_node = document.getElementById('tracks_body');

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
        // let el_new_section_body = null;

        Lib.dom.ctwo(opts.parent_node, ['div .audio_file_section', [
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
                    // el_new_section_body = node;

                    // If there are section files I need to add nodes to represent
                    // the tracks that can be played
                    if (opts.section.files) {
                        Object.keys(opts.section.files).forEach((key) => {
                            // this.createTrack({
                            //     initial: opts.initial || false,
                            //     track: opts.section.files[key],
                            //     parent_node: node
                            // });


                            const track = opts.section.files[key];

                            this.data.add(track);

                            console.log(1);
                            let el_new_audio_file = this.createAudioTrackNode({
                                initial: opts.initial || false,
                                parent: opts.parent_node,
                                track: this.data.tracks[track.key]
                            });

                            Lib.dom.ctwo(el_new_audio_file, ['input .audio_file_tag_input', {
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
                            }]);
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
        ]]);


    }

    createTrack (opts = {}) {
        const track = opts.track;

        this.data.add(track);

        let el_new_audio_file = this.createAudioTrackNode({
            initial: opts.initial || false,
            parent: opts.parent_node,
            track: this.data.tracks[track.key]
        });

        Lib.dom.ctwo(el_new_audio_file, ['input .audio_file_tag_input', {
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
        }]);
    }

    addTag (opts = {}) {
        let tag_class = 'audio_file_tag';
        if (opts.removable) tag_class += ' removable';

        Lib.dom.ctwo(opts.parent_node, [`div ${tag_class}`, [
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
        ]]);

        if (opts.save) this.data.save();
    }























    render () {
        console.log(2);
        // ctwo(this.node, ['div .container_header', [
        //     this.player.render(),
        //     // ['div #audio_player', [
        //     //     ['div #audio_player_play_pause .button HTML=PAUSE'],
        //     //     ['div #audio_player_loop .button HTML=LOOP: ON'],
        //     //     ['div #audio_player_volume'],
        //     //     ['div #choose_audio_directory .button HTML=Choose Audio Directory', {
        //     //         click: (e) => IPC.send('open_audio_dialog_modal'),
        //     //     }],
        //     //     ['div #audio_player_progress', [
        //     //         ['div #audio_player_current_time'],
        //     //         ['div #audio_player_progress_played'],
        //     //         ['div #audio_player_now_playing'],
        //     //         ['div #audio_player_duration'],
        //     //     ]],
        //     // ]],
        // ]]);

        ctwo(this.node, ['div .container_header', {
            oncreate: (node) => {
                this.player.render(node);
            }
        }], this);

        ctwo(this.node, ['div .container_body', [
            ['div #no_audio_screen .help_screen', [
                ['div #no_audio_screen_load .help_screen_action', {
                    click: (e) => IPC.send('open_audio_dialog_modal'),
                }, [
                    ['div .help_scren_main_text HTML=CLICK TO PICK AUDIO FOLDER'],
                ]]
            ]],

            ['div #tracks_section .section', [
                ['div .section_title HTML=tracks'],
                ['div #tracks_body .section_body'],
            ]],

            ['div #search_section .section', [
                ['div .section_title HTML=search'],
                ['div #search_input_wrap', [
                    ['input #search_input .text_input', {
                        click: (e) => {
                            this.onSearch(e.currentTarget.value);
                        }
                    }],
                ]],
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
        ]], this);

        this.onMount();
    }
};

module.exports = AudioContainer;
