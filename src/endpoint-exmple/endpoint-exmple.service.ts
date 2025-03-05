import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateEndpointExmpleDto } from "./dto/create-endpoint-exmple.dto";
import { UpdateEndpointExmpleDto } from "./dto/update-endpoint-exmple.dto";
import { User } from "./entities/endpoint-exmple.entity";


@Injectable()
export class EndpointExmpleService {

  public users: User[] = [
    {
      id: 1,
      name: "John Doe",
      age: 30,
    },
    {
      id: 2,
      name: "Jane Doe",
      age: 25,
    },
  ]

  create(createEndpointExmpleDto: CreateEndpointExmpleDto) {
    const newUser = {...createEndpointExmpleDto, id: this.users.length + 1};
    this.users.push(newUser);
    return newUser;
  }

  findAll() {
    return this.users;
  }

  findOne(id: number) {
    return this.users.find((user) => user.id === id);
  }

  async update(id: number, updateEndpointExmpleDto: UpdateEndpointExmpleDto) {
    let user = await this.findOne(id);
    console.log(updateEndpointExmpleDto)
    if (!user){
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.users = this.users.map(userInDB=>{
      if(userInDB.id === id){
        user = {...userInDB, ...updateEndpointExmpleDto};
        return user;
      }
      return userInDB;
    });

    return user;
  }

  remove(id: number) {
    this.users = this.users.filter((user) => user.id !== id);
    return;
  }
}
