export const isMacOSPlatform = () => {
    return Cypress.platform.includes('darwin');
};

export const removeText = (editor) => {
    editor.focus();
    editor.type('{selectall}');
    editor.type('{del}');
};

export const randomString = () => {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 10; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};