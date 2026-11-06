import{  Actor, Circle, CollisionType,Color,Vec, Engine} from "excalibur";

export class Bullet extends Actor{
    private speed: number = 400;
    private lifetime: number = 2000;
private elapsed: number = 0;
    
    constructor(direction: Vec, position: Vec){
        super({
            pos: position,
            width: 15,
            height: 15,
            collisionType: CollisionType.Passive
        });
        this.vel = direction.scale(this.speed);
        this.graphics.add(new Circle({
            radius: 7.5,
            color: Color.Yellow
        }))
    }
     onInitialize(){
        this.onCollisionStart = (event) => {
            this.kill();
        };
    }
    onPostUpdate(_engine: Engine, delta: number) {
    this.elapsed += delta;

    if (this.elapsed >= this.lifetime) {
        this.kill();
    }
}
}
