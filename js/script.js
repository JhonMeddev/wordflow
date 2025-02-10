$(document).ready(function() {
    // Carregar configurações e notas do local storage
    loadSettings();
    loadNotes();

    // Adicionar uma nova nota ao clicar no botão "Adicionar Nota"
    $('#addNote').on('click', function() {
        const noteColor = $('#noteColor').val();
        const note = $('<div></div>').addClass('note').css({
            'top': '50px',
            'left': '50px',
            'background-color': noteColor,
            'color': getContrastYIQ(noteColor)
        });

        const textArea = $('<div></div>')
            .addClass('note-text')
            .attr('contenteditable', 'true')
            .css('text-align', 'center') // Centralizar o texto
            .on('mousedown', function(e) {
                e.stopPropagation();
            })
            .on('input', function() {
                autoResize(note);
            });

        const deleteButton = $('<button></button>')
            .addClass('deleteNote btn btn-danger btn-sm')
            .html('<i class="fas fa-trash-alt"></i>');

        deleteButton.on('click', function() {
            note.remove();
            saveNotes();
        });

        note.append(textArea);
        note.append(deleteButton);
        $('#board').append(note);
        makeDraggable(note);
        autoResize(note);
        saveNotes();
    });

    // Alternar o modo escuro ao mudar o estado do checkbox
    $('#toggleDarkMode').on('change', function() {
        $('body').toggleClass('dark-mode');
        $('#board').toggleClass('dark-mode');
        $('.note').toggleClass('dark-mode');
        $('footer').toggleClass('dark-mode');
        saveSettings();
    });

    // Atualizar a cor do texto do board ao mudar a cor da nota
    $('#noteColor').on('input', function() {
        const color = $(this).val();
        const textColor = getContrastYIQ(color);
        $('#board').css('color', textColor);
        saveSettings();
    });

    // Tornar um elemento arrastável
    function makeDraggable(element) {
        let offsetX, offsetY;

        element.on('mousedown', function(e) {
            if ($(e.target).hasClass('deleteNote') || $(e.target).hasClass('note-text')) return;

            e.preventDefault(); // Evita seleção de texto indesejada

            // Captura a posição inicial do mouse relativa ao elemento
            const boardOffset = $('#board').offset();
            offsetX = (element.offset().left - boardOffset.left);
            offsetY = (element.offset().top - boardOffset.top);

            $(document).on('mousemove', moveElement);
            $(document).on('mouseup', stopMovingElement);
        });

        function moveElement(e) {
            const boardOffset = $('#board').offset();
            let newLeft = e.pageX - boardOffset.left;
            let newTop = e.pageY - boardOffset.top;

            // Garantir que a nota não ultrapasse o lado esquerdo do board
            if (newLeft < 0) {
                newLeft = 0;
            }

            element.css({
                'left': `${newLeft}px`,
                'top': `${newTop}px`
            });
        }

        function stopMovingElement() {
            $(document).off('mousemove', moveElement);
            $(document).off('mouseup', stopMovingElement);
            saveNotes();
        }
    }

    // Ajustar automaticamente o tamanho do elemento ao digitar
    function autoResize(element) {
        const textArea = element.find('.note-text');
        if (textArea.text().trim() === '') {
            element.css({
                'height': '100px',
                'width': '150px'
            });
        } else {
            element.css({
                'height': 'auto',
                'height': `${textArea[0].scrollHeight}px`,
                'width': 'auto',
                'width': `${textArea[0].scrollWidth}px`
            });
        }
    }

    // Obter a cor de contraste (preto ou branco) com base na cor de fundo
    function getContrastYIQ(hexcolor) {
        hexcolor = hexcolor.replace("#", "");
        const r = parseInt(hexcolor.substr(0, 2), 16);
        const g = parseInt(hexcolor.substr(2, 2), 16);
        const b = parseInt(hexcolor.substr(4, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? 'black' : 'white';
    }

    // Salvar as notas no local storage
    function saveNotes() {
        const notes = [];
        $('.note').each(function() {
            const note = $(this);
            notes.push({
                content: note.find('.note-text').html(),
                top: note.css('top'),
                left: note.css('left'),
                backgroundColor: note.css('background-color'),
                color: note.css('color')
            });
        });
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    // Carregar as notas do local storage
    function loadNotes() {
        const notes = JSON.parse(localStorage.getItem('notes'));
        if (notes) {
            notes.forEach(noteData => {
                const note = $('<div></div>').addClass('note').css({
                    'top': noteData.top,
                    'left': noteData.left,
                    'background-color': noteData.backgroundColor,
                    'color': noteData.color
                });

                const textArea = $('<div></div>')
                    .addClass('note-text')
                    .attr('contenteditable', 'true')
                    .css('text-align', 'center') // Centralizar o texto
                    .html(noteData.content)
                    .on('mousedown', function(e) {
                        e.stopPropagation();
                    })
                    .on('input', function() {
                        autoResize(note);
                    });

                const deleteButton = $('<button></button>')
                    .addClass('deleteNote btn btn-danger btn-sm')
                    .html('<i class="fas fa-trash-alt"></i>');

                deleteButton.on('click', function() {
                    note.remove();
                    saveNotes();
                });

                note.append(textArea);
                note.append(deleteButton);
                $('#board').append(note);
                makeDraggable(note);
                autoResize(note);
            });
        }
    }

    // Salvar as configurações no local storage
    function saveSettings() {
        const settings = {
            darkMode: $('#toggleDarkMode').is(':checked'),
            noteColor: $('#noteColor').val()
        };
        localStorage.setItem('settings', JSON.stringify(settings));
    }

    // Carregar as configurações do local storage
    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('settings'));
        if (settings) {
            if (settings.darkMode) {
                $('#toggleDarkMode').prop('checked', true);
                $('body').addClass('dark-mode');
                $('#board').addClass('dark-mode');
                $('.note').addClass('dark-mode');
                $('footer').addClass('dark-mode');
            }
            $('#noteColor').val(settings.noteColor);
            const textColor = getContrastYIQ(settings.noteColor);
            $('#board').css('color', textColor);
        }
    }
});
