const { prefix } = require('../config.json')

const validatePermissions = (permissions) => {
    const validPermissions = [
        'CREATE_INSTANT_INVITE',
        'KICK_MEMBERS',
        'BAN_MEMBERS',
        'ADMINISTRATOR',
        'MANAGE_CHANNELS',
        'MANAGE_GUILD',
        'ADD_REACTIONS',
        'VIEW_AUDIT_LOG',
        'PRIORITY_SPEAKER',
        'STREAM',
        'VIEW_CHANNEL',
        'SEND_MESSAGES',
        'SEND_TTS_MESSAGES',
        'MANAGE_MESSAGES',
        'EMBED_LINKS',
        'ATTACH_FILES',
        'READ_MESSAGE_HISTORY',
        'MENTION_EVERYONE',
        'USE_EXTERNAL_EMOJIS',
        'VIEW_GUILD_INSIGHTS',
        'CONNECT',
        'SPEAK',
        'MUTE_MEMBERS',
        'DEAFEN_MEMBERS',
        'MOVE_MEMBERS',
        'USE_VAD',
        'CHANGE_NICKNAME',
        'MANAGE_NICKNAMES',
        'MANAGE_ROLES',
        'MANAGE_WEBHOOKS',
        'MANAGE_EMOJIS',
    ]

    for (const permission of permissions) {
        if (!validPermissions.includes(permission)) {
            throw new Error(`Unknown permission node "${permissions}"`)
        }
    }
}

module.exports = (client, commandOptions) => {
    let {
        commands,
        expectedArgs = '',
        permissionError = 'You do not have permission to use this!',

        requiredArgsA = false,
        minArgsA = 0,
        maxArgsA = null,

        requiredArgsB = false,
        minArgsB = 0,
        maxArgsB = null,

        requiredArgsC = false,
        minArgsC = 0,
        maxArgsC = null,

        permissions = [],
        requiredRoles = [],
        callback,
    } = commandOptions

    if (typeof commands === 'string') {
        commands = [commands]
    }

    console.log(`\nRegistering command "${commands[0]}"`)

    if (permissions.length) {
        if (typeof permissions === 'string') {
            permissions = [permissions]
        }

        validatePermissions(permissions)
    }

    client.on('message', async (msg) => {
        const { member, content, guild } = msg

        for (const alias of commands) {
            const command = `${prefix}${alias.toLowerCase()}`

            if (
                content.toLowerCase().startsWith(`${command}`) ||
                content.toLowerCase() === command
            ) {
                for (const permission of permissions) {
                    if (!member.hasPermission(permission)) {
                        return msg.reply(permissionError)
                    }
                }

                for (const requiredRole of requiredRoles) {
                    const role = guild.roles.cache.find(
                        (role) => role.name === requiredRoles
                    )

                    if (!role || !member.roles.cache.has(role.id)) {
                        return msg.reply(`You must have the "${requiredRoles}" role to use this command`)
                    }
                }

                const args = content.split(/[ ]+/)
                args.shift()

                try {
                    if (requiredArgsA == true) {
                        if (args[0].length < minArgsA || (maxArgsA !== null && args[0].length > maxArgsA)) {
                            return msg.reply(`Incorrect syntax:Use ${prefix}${alias} ${expectedArgs}`)
                        }
                    }

                    if (requiredArgsB == true) {
                        if (args[1].length < minArgsB || (maxArgsB !== null && args[1].length > maxArgsB)) {
                            return msg.reply(`Incorrect syntax:Use ${prefix}${alias} ${expectedArgs}`)
                        }
                    }

                    if (requiredArgsC == true) {
                        if (args[2].length < minArgsC || (maxArgsC !== null && args[2].length > maxArgsC)) {
                            return msg.reply(`Incorrect syntax:Use ${prefix}${alias} ${expectedArgs}`)
                        }
                    }

                } catch {
                    return msg.reply(`Incorrect syntax:Use ${prefix}${alias} ${expectedArgs}`)
                }

                callback(msg, args, args.join(' '), client)
            
                return
            }
        }
    })
}