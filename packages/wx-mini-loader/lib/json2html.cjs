function q(v) {
    return '"' + v + '"';
}

const json2html = function json2html(json) {
    // Empty Elements - HTML 4.01
    var empty = ['area', 'base', 'basefont', 'br', 'col', 'frame', 'hr', 'img', 'input', 'isindex', 'link', 'meta', 'param', 'embed', 'import'];

    var child = '';
    if (json.child) {
        child = json.child
            .map(function (c) {
                return json2html(c);
            })
            .join('');
    }

    var attr = '';
    if (json.attr) {
        attr = Object.keys(json.attr)
            .map(function (key) {
                var value = json.attr[key];
                if (Array.isArray(value)) value = value.join(' ');
                return key + '=' + q(value);
            })
            .join(' ');
        if (attr !== '') attr = ' ' + attr;
    }

    if (json.node === 'element') {
        var tag = json.tag;
        if (empty.indexOf(tag) > -1) {
            // empty element
            return '<' + json.tag + attr + '/>';
        }

        // non empty element
        var open = '<' + json.tag + attr + '>';
        var close = '</' + json.tag + '>';
        return open + child + close;
    }

    if (json.node === 'text') {
        return json.text;
    }

    if (json.node === 'comment') {
        return '<!--' + json.text + '-->';
    }

    if (json.node === 'root') {
        return child;
    }
};

module.exports = {
    json2html,
};
