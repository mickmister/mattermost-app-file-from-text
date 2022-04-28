const FormData = require('form-data');

const Client4 = require('mattermost-redux/client/client4').default;

module.exports.commandForm = {
    icon: 'icon.png',
    submit: {
        path: '/command/submit',
        expand: {
            root_post: 'id',
        },
    },
};

const uploadForm = {
    title: "Upload Text File",
    icon: 'icon.png',
    fields: [
        {
            modal_label: 'File Name',
            name: 'name',
            type: 'text',
            is_required: true,
            value: 'test.json',
        },
        {
            modal_label: 'Content',
            name: 'content',
            type: 'text',
            subtype: 'textarea',
            is_required: true,
            value: `{
    "json": "is great!"
}`
        },
    ],
    submit: {
        path: '/upload/submit',
        expand: {
            acting_user_access_token: 'all',
            channel: 'id',
        },
    },
};

const featureChooserForm = {
    title: "Upload Text File",
    icon: 'icon.png',
    fields: [
        {
            modal_label: 'File Name',
            name: 'name',
            type: 'text',
            is_required: true,
            value: 'test.json',
        },
        {
            modal_label: 'Content',
            name: 'content',
            type: 'text',
            subtype: 'textarea',
            is_required: true,
            value: `{
    "json": "is great!"
}`
        },
    ],
    submit: {
        path: '/upload/submit',
        expand: {
            acting_user_access_token: 'all',
            channel: 'id',
        },
    },
};

const commandSubmit = async (req, res) => {
    res.json({
        type: 'form',
        form: uploadForm,
    });
};

const createFile = async (client, context, name, content) => {
    const formData = new FormData();
    formData.append('channel_id', context.channel.id);
    formData.append('files[0]', content, name);

    const file = await client.uploadFile(formData);
    return file.file_infos[0];
}

const uploadSubmit = async (req, res) => {
    const call = req.body;

    const userClient = new Client4();
    userClient.setUrl(call.context.mattermost_site_url);
    userClient.setToken(call.context.acting_user_access_token);

    const formValues = call.values;

    const file = await createFile(userClient, call.context, formValues.name, formValues.content);

    const users = [
        call.context.bot_user_id,
        call.context.acting_user.id,
    ];

    const post = {
        root_id: call.state,
        channel_id: call.context.channel.id,
        file_ids: [file.id],
    };

    try {
        await userClient.createPost(post)
    } catch (e) {
        res.json({
            type: 'error',
            error: 'Failed to create post in DM channel: ' + e.message,
        });
        return;
    }

    const callResponse  = {
        text: '',
    };

    res.json(callResponse);
};

module.exports.init = (app) => {
    app.post('/command/submit', commandSubmit);
    app.post('/upload/submit', uploadSubmit);
};
