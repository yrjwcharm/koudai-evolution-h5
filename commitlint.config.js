module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'commit-verify': [2, 'always'],
        'type-enum': [0],
        'type-empty': [0],
        'scope-empty': [0],
        'subject-empty': [0],
        'header-max-length': [0, 'always', 72],
    },
    plugins: [
        {
            rules: {
                'commit-verify': ({header}) => {
                    try {
                        let [type, subject] = header.split(':')
                        if (!type || !subject) throw Error('type或subject不能为空')
                        const typeEnum = [
                            /PR-(\d)+/, // PR-000  PR号
                            'opt', // 优化
                            'fix', // 修复
                            'refactor', // 重构
                            'merge', // merge操作
                            'revert', // revert代码
                        ]
                        let state = typeEnum.some((t) => new RegExp(t).test(type))
                        if (state) {
                            return [true, '']
                        } else {
                            throw Error('type规则应为：' + typeEnum.join('; '))
                        }
                    } catch (error) {
                        return [false, '您的提交信息不符合规范：' + error.message]
                    }
                },
            },
        },
    ],
}
