import AntDesign from 'react-native-vector-icons/Fonts/AntDesign.ttf'
import FontAwesome from 'react-native-vector-icons/Fonts/FontAwesome.ttf'
import Entypo from 'react-native-vector-icons/Fonts/Entypo.ttf'
import EvilIcons from 'react-native-vector-icons/Fonts/EvilIcons.ttf'
import Ionicons from 'react-native-vector-icons/Fonts/Ionicons.ttf'

function addFontIcon(name, icon) {
    const iconFontStyles = `@font-face {
    src: url(${icon});
    font-family: ${name};
  }`

    // Create stylesheet
    const style = document.createElement('style')
    style.dataSet = name
    style.type = 'text/css'
    if (style.styleSheet) {
        style.styleSheet.cssText = iconFontStyles
    } else {
        style.appendChild(document.createTextNode(iconFontStyles))
    }

    // Inject stylesheet
    document.head.appendChild(style)
}

const fonts = {AntDesign, FontAwesome, Entypo, EvilIcons, Ionicons}
Object.keys(fonts).forEach((k) => {
    addFontIcon(k, fonts[k])
})
