const IMAGES = {
    'MAP': {
        'MAP_ONE_WAY_WALL': 'https://lh3.googleusercontent.com/Pt8_PZpLw-jTRnktWxqK2jXjBl5cZVMhUMzeTJUOlhTed_uxixMVYfVFRBgqld5-MjFgL9tm5xAjX-dfoB0hwzbs4ewJldTDEfhu7ntCCPnwF8vox74eNrNMbkG612sM3SEYXKVOkmenrrdG4jidrYPYltZB_lKJy93yJPYibSSx8-XVam6QIYpeHdaU2P18M7KNX2NrRRfi2CGcGCJqU_qA0wwQh1Df6RcSRMPXLseQFHluJagrooYZwzl9oN31CphN54HseKQrIiUZkTR6ZDQP5aJYRYaIpCOVLrKkfTOy1jLme9aZ8jC1_WYVfXK_lzk8dwrXrphBU0z_JC_Dxr6LCwkskrA-2RorWznCrkodkjMmRXHiC8jC_BzXP3eyjUYs6-N8kCXzfisYT5hS63Tb-9VJCR7oNyztLziZk9lAmN2itCLub3X9aUjGE1adnH1zHM9j89wOwZXP_ck83CLXdIAzIGKW7lDvgyBmAHUQUBvmu25BaZDzGRGFGaMh7ZyhPlVd6FryreNv1oU7zQQ2y0nCj-K7L82N_3dtl-J_q5dcfyn_5NT1r8U8AA97Q_IKA1qi7bi1pchU5hz--4qfUKNMbK5qNyXT9ZsPbkNJ9PcTkriwu1uR7_YMpfkowJEgqjsqTmpHsIqf2fdCdWM2Pe0deqAMg9_jbaHY_dKvOyLFBDNdbX0=w1826-h1028-no',
        'MAP_DOORS': 'https://lh3.googleusercontent.com/LFDoyYOEKeH6KRLE4Kns8DRNOJxZAive2Q7AVYftrbT_8kNP_airZtR4NdGGtyFmhFwrvca0I5iplqI0Bc9r-whME6t_a6EYuNhgfwO3BS-jO3AgtKcFC1s9Ulym9gZhQiYKqs-lumY953_jS0Qb_GM_LgJDnMq7jWPzUsq-mwI7UTqA_MPzCilnRVvQzGXEF_s7UDQqLoVHtt1UGytegiJbcwIYEr8RUGvQsSdNdndThv1N1UOMEkDl2EHiOb4bSbhElU6D5CpExZrRkJU3c4UP5f-7hGeWK5AmyVJ9PfAChP3ncrh2qbsiuAOGt0oAOB8CRtcqeMTLTEthyMlARDdCOPH31pI37B1Pwtu_1Bd9WMKSFdQb2eFGSGxdI5y98OWL5TM0L_e6R-wROoO5Z2nU-fhZ8E13limMTxZPMk9FglY4clb5qQgVmNWYBRZjxls9zWdwCcaM7hyfcDSgBYpzh0Hce4LRBuSjxQctoYri2nnt4jJLW-xPXxuJMnncdrUiMS35v4mRgJPBez98dC3b3FxqdVeX7whlFO1c16q0v1XeG0uD5RmlW2MFMc6PQshC3USeC3PuVDHe0f-jZ3nUXHxgwRwqE6AWJWbbRqiEc4yYkeSc1yfVtWLVnXo1u69XLYL_JEUq0p0fI2Mh8G2CsXRJwTr2lDZ-p8ULaVH37-X91BDJzC8=w1826-h1028-no',
        'PLAYER_SCREEN_ONE': 'https://lh3.googleusercontent.com/KardL7gRPdpsQHDt3zw-Y_qPDlZkhK8Bj_RuAuOBO1jceTr8-Jj3X6cgyaemsNnYFjzCsw-1hAH1Vtjs1m2rfMpS0J0YEXBDmsCeKFe7ue9i9HcmKw_DQrKfwTtR7bXT0mwYqD--R_EPqXIoA3feeT5-f52qKsOjzFHbqO4VTeyhzzYJzL-sStggJ-E1YY_r4qX06R0OykrZ-nyMU2WTrp0RWyppqbdaUjeUXrVh_52Havbr5ZET_2bX3CMyPaJbuG_gShtbf4qmwxQl3eJiFzKUtCk3KKEh0HpdCFcxu1LnNJvzhjCPlBhH7AkOtRySk3SHb4755LyLTivv4fpv2NtpCMUWlJu9Jn7AC7NZHL-eWSoPD_Aaiqurg8KZkzSEUD7PU01yJdty9xxVClJymf588faRSFkBOinfEFNyRvlBsQZa37T_NVkdiQV2ck-3WQjzMhEDwcZ2Z1dRVPai6x5CIVW2CYoN9O_9SvIMqHTyyDBKMa1rMmBFvOy9R_x-2xHF3y_Q3UH71k2q_EDf-ORl9uUHK-i8C33pp64VBLcXr01H1WQW4sSxALLgsbuO_3z2I-UGIJFnU6smg1iZUYYkTdInlztwJ6zaZZV860Cc_gCHEEY9Fb5PERuDdBeyhi6VcxydvWCZFIQN_yugwIWwjWtbbnevImrx4_yz8NrIzf962DjC7qA=w1521-h1028-no',
        'PLAYER_SCREEN_TWO': 'https://lh3.googleusercontent.com/3bA5aBd2ueGH1rHwtWCqk_GIC3AlD3FNnECnRBQESlI4v0MYTkllo8EccB5MEqp6jjGTx_JMAtvjAj7F6V-1BisQXbvnvUQHzNCgxJKGxFCKU3B5ZA6kVG5WFGTB5Lw7TeqfJYg9LiNj4XE1ErxjI-ObVA_ArKKEByfd1qxxHge_0Jh3zUHcKhp4rJ2o-0mxbvOGHNhtTA4So2Q_jZobFHzWJoZFsPL2poEaD8t6dkJrujak8NcN44jYgEhHWRVsyVk1CDpjdAVnjTRgjPoXPP0YBoqAIoYJ8IJXbAKZgXJEiCfvWkD6T_NmTCwWVfwEaNhFWVVgVlixjVSPd9z73CBjJNBvYm7kpwrn1IdJ_8iG7jh2FQi_0BZp6qsewgfyKN6BJ2FD9iWbzJdnW9bMWytRIJdZImDhOPhaQi6FECCf7OOHQ-d4o5Ss4xWT_UAGgPgxEDToniqqwXnXDRC9loqMTwbOo79MvudL29XIJliO6Uo68cs_C2e_ZsUL0BnKSCxVtoKgJ6rfJmLO14HW-VVDMOkF7YJYJ7DCob_Sp1NO4WE-ePo_PZhSQeTISkpro3auREC6_hpUDGrXnsqRNLYqnziFLlRqmvjWCsxVE3AS8ByLsL1AXke0YRV1T12nnZINewnmGnxzkvhysA6zDTOl40OWkH0P7U81vJvWtsOYDjZ5LiXyeb0=w1521-h1028-no',
    },
    'AUDIO': {
        'OVERVIEW': 'https://lh3.googleusercontent.com/-X4dLI7NGMlIi6D5seF-7xTs75u4GA3V78Pe2ULF75Re7UCZXT6rx-_Fbvy3GktW5suvRPzeEyrmIohKiCvz7nV0-iNQ8okepEXgikfn2lobL09IgtnsQOo0yJ_t8q_d1UyeiKOmCiV0sbTyxKLrWfa3TJrw8VLS7IfrGPo44I8_oP8woXVBrSMmy3q2xom3ihwVDfPfJwX9Rb3RUwOxwwZ7BHB7HsvR2XoYWwUL5-LJfZ0S76uXIvQFxbBhITvkkRGnzgRRGHc1l4A6rU5ySDj-yIJZgZcozXngoBOFAsDi-w7Sa41BryUfeaNxNDjS2KpkQf6dgxiHbgjeZW5modrzqaN7MX4zFsjpPQABj6bkVF2v2w9HL2V8RR5HxuQElBsi4cXTzhTAD7nNWpDe0CA7ULELxSk5snCykpemtBzX2zjz978PAZWa0Cxh3AYiL6EJ9GE6xdIEVNECfM4zPUIjSK1c238yOfd3KTuUf7CJ7vk_P99N4vq-Y9-k3tJiR8SWFpr-1UjuWlckufglFigL5O7Zp5Q19vtxh_63R-YxnZcKb8KyHJeIn7GlJI54K6h_hMGx624tFWwolZg_VyXaq0OMxKyE92-mAU-6i3x7Cv2wpGr23SCVPeGe2YOMHtB0QYMyXIbgQcRSRNTEvzKf3g4tSysoEzl8NWUm6W5KHk2OFSWtq_A=w1826-h1028-no',
    },
    'INFO': {
        'OVERVIEW': 'https://lh3.googleusercontent.com/5DJgIrzsnEFACqMd74goA1hWWV01ey7fkyJzKoxIGQi0cWTwHFJAP6ub7BwWu7klOGzvyQz0mT1i8zbc9mCjoE9tIgiFYm_DOCt32y5W5P4JddnyuiF6S5ZTSyzgg9Emvn7LojNE_n-iySXLd2DMePuP_uIeUy0kwJZCzsuzBcebYzIR2fzjxZ3ljs3TWPx8-7jIxPKZkSZk35zyqB2PJI8W0TqVSXxKHwQNBeCloSFsIrMEGW27Ocz-FZPbyCxkRVyvFLb8-5Uftzn8mGRfdglWZHA_E4a15SW43daQf2tMyW9cjvF9Ds3qtW6M2m9kwQy0koAC8y1zJ7MS2RRiFwMQzehKTgLExG_YjwJGfx3fEC2DwAfPI1MgGL5S09WwqwOemOzv8mnHmUVGlm_GwhWb4uJZS4ZgBmcuZA1rX_jLUJZwXI7tvjYO620KrwrOK-p2vHcPMLIrWZlDd_Xak4yNnJefsjbnPAEMIFqtTFrENPuxTivM3cqLu0ozhR82BMVNleUv_fJiO-I3Fjc_dlsfiI1SVYMI2vJOscgqLxfUxH3GHtozhLYge1Wd618NoVd5sZJIOup18V6uJIRXCHIQH6cI82sRyXvxCb9wEQ4T7v-JcnaKVBYE-ifTQ8VwD0wGYK23endSwcs9JTkWeq62N6hm877cBWKf4dJbMun3jrFGzccETOs=w1826-h1028-no',
    },
    'LIGHTS': {
        'OVERVIEW': 'https://lh3.googleusercontent.com/bf1e7vwijtdykawiP6_indkQlJqADMmLpx7VKWVFBv0-4FXsLHa4XadoFIK1wPdUCxodNW-hQ3R0FFPp49RZYWPMVLjXLZkXBdN3ttuJqCBccwRiV21BnKC9xc9lt4w5bzEBQ3BOcqMqca8GahxsTmv6QU4T4apeHwyuV9GmJDfMy1Fz9jbxYP7VznAhrm9vhWK-aGsCWNwu_zmTFajERSSy1l2bk64fJB8qIFcW-hVfMUVxD9CVyropq3vDy9S7JswvnLbsw9IyTao6f5o7yeYUwNI3iIrtGjOXH8uCzCk0edZlwzElS1OdYbHyXd5RWrkvK5dC9OXAsokfKnPgSA8m-JurJplS17vfoLdeQQyaqNz8sT6w8aGzAgPedeDrFH78nrpEkc01wJawT7W5LPKMEpbbbVYnJ1RS46oZ-uxeMSb6NdCgcn5bqIE5rm1yAk63an-LOZFupyaZELgOPXg0PFZUJrUomeB2QbIjZf0XOzl2PaK2ZOva0VFMD6QPlxM2jRKC84fZbjzos8JVfkPLy1LkVsNX4VDjxamNFyjozXrqEKXIf5PO0ZhKnfmmBPFY7icvDBhn-boMUuBAD7YyrsRmBIq8iwUAB0wPie5lawbQ5kRC8glcEp1XRGuSpcKoUKqieg7uLpxI0dg1NJbOkv2i3yLGox-W-G3RaakeIC39WBnev8Y=w1826-h1028-no',
    }
}

let el_image_modal = null;
let el_image_modal_img = null;

function populateImages () {
    for (let section_key in IMAGES) {
        try {
            const section_node = document.getElementById(section_key.toLowerCase());
            const section_images = section_node.getElementsByClassName('section_images')[0];
            for (let image_key in IMAGES[section_key]) {
                const image_source = IMAGES[section_key][image_key];
                let image_node = createElement('img', 'section_image', {
                    src:  image_source,
                    addTo: section_images
                });

                image_node.addEventListener('click', (e) => {
                    el_image_modal.classList.remove('hidden');
                    el_image_modal_img.style.backgroundImage = `url("${image_source}")`;
                });
            }
        } catch (e) {
            console.error('Problem loading images for key: ' + image_key);
            console.log(e);
        }
    }
}

window.onload = () => {
    el_image_modal = document.getElementById('image_modal');
    el_image_modal_img = document.getElementById('image_modal_img');

    el_image_modal.addEventListener('click', (e) => {
        el_image_modal.classList.add('hidden');
        el_image_modal_img.style.backgroundImage = `url("")`;
    });

    populateImages();

}

function createElement (type, classes, opts = {}) {
    let node = document.createElement(type);

    (classes || '').split(' ').forEach((class_name) => {
        node.classList.add(class_name);
    });

    configureElement(node, opts);

    if (opts.prependTo) {
        if (!opts.prependTo.length) opts.prependTo = [opts.prependTo];
        opts.prependTo.forEach((container) => {
            container.insertBefore(node, container.firstChild);
        });
    }

    if (opts.addTo) {
        if (!opts.addTo.length) opts.addTo = [opts.addTo];
        opts.addTo.forEach((container) => {
            container.appendChild(node);
        });
    }

    return node;
}

function configureElement (node, opts = {}) {
    if (opts.attributes) {
        for (let attr in opts.attributes) {
            if (opts.attributes[attr]) {
                node.setAttribute(attr, opts.attributes[attr]);
            }
        }
    }

    if (opts.dataset) {
        for (let data in opts.dataset) {
            if (opts.dataset[data]) {
                node.dataset[data] = opts.dataset[data];
            }
        }
    }
    // You know, incase the fucking html is the number 0
    if (typeof opts.html !== "undefined") {
        node.innerHTML = opts.html;
    }

    if (opts.events) {
        for (let event in opts.events) {
            node.addEventListener(event, opts.events[event]);
        }
    }

    if (opts.css) {
        for (let style in opts.css) {
            node.style[style] = opts.css[style];
        }
    }

    if (opts.src) {
        node.src = opts.src;
    }

    return node;
}
