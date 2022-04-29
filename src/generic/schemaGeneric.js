import _ from 'lodash';
import callApi from 'src/common/lib/callApi';

export const schemaGeneric = {
    entities : [],
    relations : [],
    nameColumns : [],
    commonCodeList : [],
    customFunctions : {
        sm_anpl_dspl_ask_n : {
            entityId : 'sm_anpl_dspl_ask_n' ,
            entityNm : '타소전시신청내역', 
            showSubData : true, 
            afterOnload : (payload) => {
                let {uiType, openType, editType, form} = payload;

                const getSequence = async () => {
                    const {isSuccess, data} = await callApi({
                        url: `/generic/getSequence`,
                        method: 'post',
                        data: {sequenceName : 'somSequence'} ,
                        isLoding : false
                    });
                    if (isSuccess && data) {
                        let dispatch = window.state_search.dispatch;
                        let actions = window.state_search.actions;
                        dispatch( actions.setValue2('instances.' + payload.id + '.form.mngNo'), data.sequence);
                    }
                };

                if( uiType === 'detail' && editType === 'insert') {
                    getSequence();
                    console.log('customFunctions');
                }
            },
            sheet : {
                cols : {
                    someColumnName : {
                        attr : 'attr'
                    }
                }
            },
            groups : [
                {
                    id : 'general' ,
                    label : 'general' ,
                    items : [
                        [
                            {label : 'label', name: 'name'},
                            {label : 'label1', name: 'name1'}
                        ]
                    ]
                }
            ]
        }
    }  
};

export const mergeCols = (cols, entityId) => {
    let rtnCols = _.cloneDeep(cols);
    let _this = schemaGeneric;
    if( !_this || !_this.customFunctions){
        return rtnCols;
    }
    let custom = _this.customFunctions[entityId];
    if(custom){
        rtnCols = _.map(rtnCols, (col) => {
            let rtn = col;
            if( custom.sheet && custom.sheet.cols && custom.sheet.cols[col.Name]){
                _.merge(rtn, custom.sheet.cols[col.Name]);
            }
            return rtn;
        });
    }
    return rtnCols;
};