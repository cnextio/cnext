# Dockerized codemirror, pyls application

## Intergrations done
1. codemirror6: https://github.com/codemirror/CodeMirror
2. python language server (pyls - palantir): https://github.com/palantir/python-language-server
3. jsonrpc to server pyls over websocket for interactive codemirror linting: https://github.com/palantir/python-jsonrpc-server
4. updated state management so that both ls and editorView state
5. created this sample react application as special thanks to the inspiration of the following authors (https://hjr265.me/blog/codemirror-lsp/, https://github.com/sachinraja/rodemirror) and not to forget the origin of codemirror: https://github.com/codemirror/codemirror.next


## To setup
```
user@computer:~/$ git clone <GITHUB_URL>  
user@computer:~/codemirror-react-test$ docker-compose up -d --build
```


## Demo output
1. Custom python files to be added in ./pyls_jsonrpc/custom_module/ to be served by palantir python language server
2. an example hello.py is added with 3 functions 
3. As shown on image, may click on button to test effect of state and editor. (idea is for editor_state to always be the 'truth' and code to overwrite and recreate codemirror view)

![alt text](https://github.com/guanyou-git/codemirror-react-test/blob/master/readme_image/intellisense.png)