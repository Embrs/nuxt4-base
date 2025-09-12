export const StoreDemo = defineStore('StoreDemo', () => {
  const aa = UseEncryptCookie<number>('StoreDemo-aa', 123);
  // const aa = useCookie('StoreDemo-aa', { default: () => 123});
  // const aa =  useState('my-shallow-state', () =>123);

  const Set = (value: number) => {
    aa.value = value;
  };

  return { aa, Set };
},);