
//Octree Class
class Octree {

    constructor(size) {
        this.root = new Node(size, [0,0,0]);
    }

    Insert(point) {
        this.root.Insert(point);
    }

    Search(point) {
        if(point===null)
            return null;
        return this.root.Search(point);
    }

    // Delete a point
    Delete(point) {
        // search it first when deleting a node
        let node = this.Search(point);
        if(node===null) {
            return false;
        }
        else {
            let parent = node.parentNode;
            if(parent!==null) {
                parent.Delete(node);
                if(parent.length===1&&parent===this.root) {
                    let otherNode;
                    for(let i=0; i<8; i++) {
                        if(parent.childNodes[i]!==null) {
                            otherNode = parent.childNodes[i];
                            break;
                        }
                    }
                    if(otherNode.end) {
                        parent.point = otherNode.point;
                        parent.Delete(otherNode);
                        parent.end = true;
                        parent.empty = false;
                    }
                }
                else if(parent.length===1&&parent!==this.root) {
                    let otherNode;
                    let otherPoint;
                    for(let i=0; i<8; i++) {
                        if(parent.childNodes[i]!==null) {
                            otherNode = parent.childNodes[i];
                            break;
                        }
                    }
                    if(otherNode.end) {
                        otherPoint = otherNode.point;
                    }

                    // delete the node without data in it
                    while(parent.length===1&&parent!==this.root) {
                        parent.Delete(otherNode);
                        otherNode = parent;
                        parent = parent.parentNode;
                    }
                    if(parent.length===1) {
                        parent.Delete(otherNode);
                    }
                    if(otherPoint!==null)
                        parent.Insert(otherPoint);
                }
            }
            return true;
        }
    }
}

// Node Class
class Node {
    constructor(size, startPoint){
        this.childNodes = {
            0: null,
            1: null,
            2: null,
            3: null,
            4: null,
            5: null,
            6: null,
            7: null
        };
        this.startPoint = startPoint;
        this.point = null;
        this.end = false;
        this.empty = true;
        this.length = 0;
        this.size = size;
        this.parentNode = null;
        let halfLen = Math.floor(size[0]/2);
        let halfWid = Math.floor(size[1]/2);
        let halfHei = Math.floor(size[2]/2);
        let levLen = size[0] - halfLen;
        let levWid = size[0] - halfWid;
        let levHei = size[0] - halfHei;

        this.childNodesSize =[[halfLen, halfWid, halfHei],[halfLen, halfWid, levHei],[halfLen, levWid, halfHei], [levLen, halfWid, halfHei],
            [levLen, levWid, halfHei],[levLen, halfWid, levHei],[halfLen, levWid, levHei], [levLen, levWid, levHei]];
        this.childStartNode = [[startPoint[0],startPoint[1],startPoint[2]], [startPoint[0],startPoint[1],startPoint[2] + halfHei], [startPoint[0], startPoint[1] + halfWid, startPoint[2]], [startPoint[0] + halfLen, startPoint[1], startPoint[2]],
            [startPoint[0] + halfLen,startPoint[1] + halfWid,startPoint[2]], [startPoint[0] + halfLen,startPoint[1],startPoint[2] + halfHei], [startPoint[0], startPoint[1] + halfWid, startPoint[2] + halfHei], [startPoint[0] + halfLen, startPoint[1] + halfWid, startPoint[2] + halfHei]];
    }

    // this function is not suggested to change
    __getIndex(point) {
        for(let i=0; i<8;i++) {
            if(point[0]>=this.childStartNode[i][0]&&point[0]<=this.childStartNode[i][0]+this.childNodesSize[i][0]&&
                point[1]>=this.childStartNode[i][1]&&point[1]<=this.childStartNode[i][1]+this.childNodesSize[i][1]&&
                point[2]>=this.childStartNode[i][2]&&point[2]<=this.childStartNode[i][2]+this.childNodesSize[i][2])
                return i;
        }
    }

    static __createBall(point) {
        let sphereGeometry = new THREE.SphereGeometry(5, 5, 5);
        let sphereMaterial = new THREE.MeshBasicMaterial({color: 'red', wireframe: true});
        let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.x = point[0];
        sphere.position.y = point[1];
        sphere.position.z = point[2];
        return sphere;
    }

   static __createCubic(startPoint, size) {
        let cubeGeometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
        let cubeMaterial = new THREE.MeshBasicMaterial({color: 'yellow', wireframe: true});
        let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.x = startPoint[0] + Math.floor(size[0]/2);
        cube.position.y = startPoint[1] + Math.floor(size[1]/2);
        cube.position.z = startPoint[2] + Math.floor(size[2]/2);
    }

    // insert a point
    Insert(point){
        if(point===null)return;
        if(this.end&&Node.__compare(point, this.point)) {
            return;
        }
        if(this.empty) {
            this.point = point;
            this.end = true;
            this.empty = false;
        }
        else {
            if (this.end) {
                let index = this.__getIndex(point);
                this.childNodes[index] = new Node(this.childNodesSize[index], this.childStartNode[index]);
                this.length += 1;
                this.childNodes[index].parentNode = this;
                this.childNodes[index].Insert(point);
                let index1 = this.__getIndex(this.point);
                if (index1 !== index) {
                    this.childNodes[index1] = new Node(this.childNodesSize[index1], this.childStartNode[index1]);
                    index = index1;
                    this.length += 1;
                }
                this.childNodes[index].Insert(this.point);
                this.childNodes[index].parentNode = this;
                this.point = null;
                this.end = false;
            }
            else {
                let index = this.__getIndex(point);
                if (this.childNodes[index] === null) {
                    this.childNodes[index] = new Node(this.childNodesSize[index], this.childStartNode[index]);
                    this.length += 1;
                }
                this.childNodes[index].Insert(point);
                this.childNodes[index].parentNode = this;
            }
        }
    }

    Delete(node){
        for(let i=0; i<8; i++)
            if(this.childNodes[i]!==null && node===this.childNodes[i]) {
                this.childNodes[i] = null;
                this.length -= 1;
                if(this.length===0) {
                    this.empty = true;
                }
                return true;
            }
        return false;
    }

    static __compare(point1, point2) {
        for(let i=0; i<3; i++) {
            if(point1[i]!==point2[i])
                return false;
        }
        return true;
    }

    // search a point
    Search(point){
        if(point===null)
            return null;
        if(this.end===true && this.point!==null && Node.__compare(point, this.point))
            return this;
        for(let i=0; i<8; i++) {
            if(this.childNodes[i]!==null) {
                let node = this.childNodes[i].Search(point);
                if(node!==null) {
                    return node;
                }
            }
        }
        return null;
    }
}
