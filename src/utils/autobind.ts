export default function Autobind(target: any, title: string, propertyDescriptor: PropertyDescriptor): PropertyDescriptor {


    // value 為原本的 method function
    const orignalMethod = propertyDescriptor.value;

    // 設定新的 descriptor
    // descriptor 有分為 data descriptor 與 accessor descriptor
    // data => 有 value 與 writable 屬性
    // accessor => 有 get 與 set 屬性
    // 兩者不可同時使用

    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        enumerable: false,
        get() {
            // 因為 this 會根據是誰呼叫方法的人決定，所以在這邊先綁定 this 一定是我們所創建的實體
            const boundFn = orignalMethod.bind(this);
            return boundFn;
        }
    }

    return adjDescriptor;

}