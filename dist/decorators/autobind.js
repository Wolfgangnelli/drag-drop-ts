export function Autobind(_, _2, descriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor = {
        configurable: true,
        get() {
            const boundFun = originalMethod.bind(this);
            return boundFun;
        }
    };
    return adjDescriptor;
}
//# sourceMappingURL=autobind.js.map