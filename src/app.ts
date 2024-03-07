//데코레이션
//!!! 데코레이터도 함수다!
//클래스나 클래스 메서드가 올바르게 사용되었는지 확인하는 작업이나, 내부적인 변환 작업등을 수행하는데 사용

// function Logger(constructor: Function) {
//     console.log("Logging...");
//     console.log(constructor);
// }

function Logger(logString: string) {
    // 이렇게 해야지 원하는 값을 추가를 할 수가 있음!
    console.log("Logger Factory");
    return function (constructor: Function) {
        console.log(logString);
        console.log(constructor);
    };
}

function WithTemplate(template: string, hookId: string) {
    console.log("Template Factory");
    return function <T extends { new (...args: any[]): { name: string } }>(
        originalConstructor: T
    ) {
        // constructor인데 constructor에 대해 사용하지 않으니 _로 쓴것(인자가 들어오는 건 알지만 필요하지 않음을 나타냄)

        return class extends originalConstructor {
            constructor(..._: any[]) {
                super();
                console.log("Rendering template");

                const hookEl = document.getElementById(hookId);
                if (hookEl) {
                    hookEl.innerHTML = template;
                    hookEl.querySelector("h1")!.textContent = this.name;
                }
            }
        };
    };
}

//클래스  =>WithTemplate => Logger 로 실행이 됨. constructor일때
@Logger("Logging")
@WithTemplate("<h1>My person Object</h1>", "app") //생성자 함수를 실행하면서 이 부분도 실행이 되기 때문
class Person {
    name = "HJ";

    constructor() {
        console.log("Creating person object...");
    }

    hello() {
        console.log(123123123123);
    }
}

const pers = new Person();
console.log(pers);

// ---
function Log(target: any, propertyName: string | Symbol) {
    //프로퍼티에 데코레이터를 추가하면 데코레이터로 2개의 인자가 들어옴 외워! 첫번째 인자 프로퍼티의 타겟 두번째 인자는 프로퍼티 이름이 들어옴
    console.log("property decorator!");
    console.log(target, propertyName);
}

function Log2(target: any, name: string, descriptor: PropertyDescriptor) {
    console.log("Accessor Decorator");
    console.log(target);
    console.log(name);
    console.log(descriptor);
}

function Log3(
    target: any,
    name: string | Symbol,
    descriptor: PropertyDescriptor
) {
    console.log("Method Decorator");
    console.log(target);
    console.log(name);
    console.log(descriptor);
}

function Log4(target: any, name: string | Symbol, position: number) {
    console.log("Parameter Decorator");
    console.log(target);
    console.log(name);
    console.log(position);
}

class Product {
    @Log //이 로그는 title 바로 위에만 있기 때문에 밑에는 적용이 되지 않음
    title: string;

    // @Log
    private _price: number;
    @Log2
    set price(val: number) {
        if (val > 0) {
            this._price = val;
        } else {
            throw new Error("Invalid price - should be postive!");
        }
    }

    constructor(t: string, p: number) {
        this.title = t;
        this._price = p;
    }
    @Log3
    getPriceWithTax(@Log4 tax: number) {
        return this._price * (1 + tax);
    }
}

// 데코레이터는 메서드를 호출할 때나 프로퍼티를 사용할 때처럼 런타임에 실행되는 것이 아님
//클래스가 정의될 때 배후에서 부가적인 설정작업을 진행 가능
//즉 아무리 인스턴스가 많더라도 한번만 실행이됨.
const p1 = new Product("Book", 19); // 이부분이 인스턴스
const p2 = new Product("Book 2", 29);

function AutoBind(_: any, _2: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value; //이렇게 하면 원본 메서드에 접근할 수 있음
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        enumerable: false,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        },
    };
    return adjDescriptor;
}

p1.getPriceWithTax(10);

class Printer {
    message = "This works";

    @AutoBind
    showMessage() {
        console.log(this.message);
    }
}

const p = new Printer();

const button2 = document.querySelector("button")!;
// button2.addEventListener("click", p.showMessage.bind(p)); 기본적으로 여기서 this 가르키는게 다름
button2.addEventListener("click", p.showMessage);

//미션! 데코레이터로 언제 어디서든 bind를 사용하지 않고 this.message를 불러 올 수 있도록 함!

interface ValidatorConfig {
    [property: string]: {
        [validatableProp: string]: string[]; //
    };
}

const registeredValidators: ValidatorConfig = {};

function Required(target: any, propName: string) {
    registeredValidators[target.constructor.name] = {
        ...registeredValidators[target.constructor.name],
        [propName]: [
            ...(registeredValidators[target.constructor.name]?.[propName] ??
                []),
            "required",
        ],
    }; // course
}

function PositiveNumber(target: any, propName: string) {
    registeredValidators[target.constructor.name] = {
        ...registeredValidators[target.constructor.name],
        [propName]: [
            ...(registeredValidators[target.constructor.name]?.[propName] ??
                []),
            "positive",
        ],
    };
}

function validate(obj: any) {
    const objValidatorConfig = registeredValidators[obj.constructor.name];
    if (!objValidatorConfig) {
        return true;
    }
    let isValid = true;
    for (const prop in objValidatorConfig) {
        console.log(prop);
        for (const validator of objValidatorConfig[prop]) {
            switch (validator) {
                case "required":
                    isValid = isValid && !!obj[prop];
                    break;
                case "postive":
                    isValid = isValid && obj[prop] > 0;
                    break;
            }
        }
    }
    return isValid;
}
class Course {
    @Required
    title: string;
    @PositiveNumber
    price: number;

    constructor(t: string, p: number) {
        this.title = t;
        this.price = p;
    }
}

const courseForm = document.querySelector("form")!;
courseForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const titleEl = document.getElementById("title") as HTMLInputElement;
    const priceEl = document.getElementById("price") as HTMLInputElement;

    const title = titleEl.value;
    const price = +priceEl.value;

    const createdCourse = new Course(title, price);

    if (!validate(createdCourse)) {
        alert("Invalid input , please try again!");
        return;
    }
    console.log(createdCourse);
});
