// exports.ajax = function (url, opts) {
//     opts.success = typeof opts.success === 'function' ? opts.success : function () {};
//     opts.error = typeof opts.error === 'function' ? opts.error : function () {};
//     opts.complete = typeof opts.complete === 'function' ? opts.complete : function () {};

//     opts.headers = typeof opts.headers === 'object' ? opts.headers : {};

//     var xhr = new XMLHttpRequest();
//     var xhr_timeout;
//     xhr.open(opts.type || 'get', url, true);

//     // Set any custom headers
//     for (var header in opts.headers) {
//         xhr.setRequestHeader(header, opts.headers[header]);
//     }

//     xhr.setRequestHeader('Authorization', 'Bearer ca5b1f77e93fb039ffcc69b8c181d1f21d2890f8a80af42996e50f55cc153d78');

//     // Handle status change
//     xhr.onreadystatechange = function () {
//         if (xhr.readyState === 4) {
//             clearTimeout(xhr_timeout);
//             if (xhr.status === 200 || xhr.status === 204 || xhr.status === 304) {
//                 var response_json = JSON.parse(xhr.responseText);
//                 opts.success(response_json, xhr.status, xhr);
//             } else {
//                 opts.error(xhr.responseText, xhr.status, xhr);
//             }
//             opts.complete(xhr.responseText, xhr.status, xhr);
//         }
//     };

//     // Setup timeout if specified
//     if (opts.timeout) {
//         xhr_timeout = setTimeout(function () {
//             xhr.abort();
//             xhr.onreadystatechange = function () {};
//             opts.error(undefined, 0, xhr);
//             opts.complete(undefined, 0, xhr);
//         }, opts.timeout);
//     }

//     // Send the request
//     xhr.send(opts.data);
// }

module.exports = function (url, opts) {
    opts.success = typeof opts.success === 'function' ? opts.success : function () {};
    opts.error = typeof opts.error === 'function' ? opts.error : function () {};
    opts.complete = typeof opts.complete === 'function' ? opts.complete : function () {};

    opts.beforeSend = typeof opts.beforeSend === 'function' ? opts.beforeSend : function () {};
    opts.headers = typeof opts.headers === 'object' ? opts.headers : {};
    opts.timeout = typeof opts.timeout === 'number' && opts.timeout > 0 ? opts.timeout : null;

    var xhr = new XMLHttpRequest();
    var xhr_timeout;
    xhr.open(opts.type || 'get', url, true);

    // Set any custom headers
    for (var header in opts.headers) {
        xhr.setRequestHeader(header, opts.headers[header]);
    }
    xhr.setRequestHeader('Authorization', 'Bearer ca5b1f77e93fb039ffcc69b8c181d1f21d2890f8a80af42996e50f55cc153d78');
    xhr.setRequestHeader('Content-Type', 'application/json');

    // Handle status change
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            clearTimeout(xhr_timeout);
            if (xhr.status === 200 || xhr.status === 204 || xhr.status === 304) {
                var response_json = JSON.parse(xhr.responseText);
                opts.success(response_json, xhr.status, xhr);
            } else {
                opts.error(xhr.responseText, xhr.status, xhr);
            }
            opts.complete(xhr.responseText, xhr.status, xhr);
        }
    };

    // Give caller access to xhr object before sending
    opts.beforeSend(xhr);

    // Setup timeout if specified
    if (opts.timeout) {
        xhr_timeout = setTimeout(function () {
            xhr.onreadystatechange = function () {};
            xhr.abort();
            opts.error(undefined, 0, xhr);
            opts.complete(undefined, 0, xhr);
        }, opts.timeout);
    }

    // Send the request
    xhr.send(opts.data);
};
