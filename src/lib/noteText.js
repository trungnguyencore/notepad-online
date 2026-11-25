// Keep block boundaries when extracting text for both search and previews.
export function getPlainText(content) {
    if (!content) return '';
    const document = new DOMParser().parseFromString(String(content), 'text/html');
    document.querySelectorAll('br, hr').forEach(node => node.replaceWith('\n'));
    document.querySelectorAll('p, div, li, ul, ol, h1, h2, h3, h4, h5, h6, blockquote, pre, tr, td, th')
        .forEach(node => {
            node.prepend('\n');
            node.append('\n');
        });
    return (document.body.textContent || '').replace(/\s+/g, ' ').trim();
}

export function hasImages(content) {
    return /<img\b/i.test(String(content || ''));
}
