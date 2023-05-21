import {px} from '../../../utils/appUtil'
import {Font} from '../../../common/commonStyle'

const res = {
    monthFlex: {
        display: 'flex',
        marginTop: px(24),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    month: {
        display: 'flex',
        flexDirection: 'column',
        marginBottom: px(8),
        // width: px(154),
        width: window.innerWidth / 3.6,
        height: px(92),
        backgroundColor: '#f5f6f8',
        borderRadius: px(8),
        alignItems: 'center',
        justifyContent: 'center',
    },
    monthText: {
        fontSize: px(24),
        color: '#121D3A',
    },
    monthProfit: {
        marginTop: px(4),
        fontSize: px(22),
        fontFamily: Font.numMedium,
        fontWeight: '500',
        color: '#9AA0B1',
    },
}
export default res
