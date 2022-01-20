class TrustValueAlgo {
    constructor(trust_num, untrust_num, F = function f(x) {return x}) {
        this.F = F;
        this.trust_num = trust_num;
        this.untrust_num = untrust_num;
    }

    get_trust_value() {
        let theta = this.F(this.trust_num) / (this.F(this.trust_num) + this.F(this.untrust_num));
        let alpha = this.F(this.untrust_num) / (this.F(this.trust_num) + this.F(this.untrust_num));

        return (theta*this.trust_num - alpha*this.untrust_num) / (this.trust_num + this.untrust_num);
    }
}