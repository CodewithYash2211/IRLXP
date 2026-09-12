import json
import struct
from pathlib import Path

out = Path(r'C:\Users\srosh\IRLXP\public\models\avatar\character.glb')
out.parent.mkdir(parents=True, exist_ok=True)

positions = [
    -0.5, -0.5,  0.5,  0.5, -0.5,  0.5,  0.5,  0.5,  0.5, -0.5,  0.5,  0.5,
    -0.5, -0.5, -0.5, -0.5,  0.5, -0.5,  0.5,  0.5, -0.5,  0.5, -0.5, -0.5,
    -0.5, -0.5, -0.5, -0.5, -0.5,  0.5, -0.5,  0.5,  0.5, -0.5,  0.5, -0.5,
     0.5, -0.5, -0.5,  0.5,  0.5, -0.5,  0.5,  0.5,  0.5,  0.5, -0.5,  0.5,
    -0.5,  0.5, -0.5, -0.5,  0.5,  0.5,  0.5,  0.5,  0.5,  0.5,  0.5, -0.5,
    -0.5, -0.5, -0.5,  0.5, -0.5, -0.5,  0.5, -0.5,  0.5, -0.5, -0.5,  0.5,
]

normals = [
    0,0,1, 0,0,1, 0,0,1, 0,0,1,
    0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
    -1,0,0, -1,0,0, -1,0,0, -1,0,0,
    1,0,0, 1,0,0, 1,0,0, 1,0,0,
    0,1,0, 0,1,0, 0,1,0, 0,1,0,
    0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0,
]

indices = [
    0,1,2, 0,2,3,
    4,5,6, 4,6,7,
    8,9,10, 8,10,11,
    12,13,14, 12,14,15,
    16,17,18, 16,18,19,
    20,21,22, 20,22,23,
]

pos_bytes = struct.pack('<' + 'f' * len(positions), *positions)
normal_bytes = struct.pack('<' + 'f' * len(normals), *normals)
index_bytes = struct.pack('<' + 'H' * len(indices), *indices)

json_obj = {
    'asset': {'version': '2.0', 'generator': 'IRLXP Avatar Asset'},
    'scene': 0,
    'scenes': [{'nodes': [0]}],
    'nodes': [{'mesh': 0, 'name': 'Character'}],
    'meshes': [{
        'name': 'Character',
        'primitives': [{'attributes': {'POSITION': 0, 'NORMAL': 1}, 'indices': 2, 'material': 0, 'mode': 4}]
    }],
    'materials': [{
        'name': 'AvatarMaterial',
        'pbrMetallicRoughness': {'baseColorFactor': [0.94, 0.82, 0.66, 1.0], 'metallicFactor': 0.15, 'roughnessFactor': 0.85},
        'doubleSided': True,
    }],
    'buffers': [{'byteLength': len(pos_bytes) + len(normal_bytes) + len(index_bytes)}],
    'bufferViews': [
        {'buffer': 0, 'byteOffset': 0, 'byteLength': len(pos_bytes), 'target': 34962},
        {'buffer': 0, 'byteOffset': len(pos_bytes), 'byteLength': len(normal_bytes), 'target': 34962},
        {'buffer': 0, 'byteOffset': len(pos_bytes) + len(normal_bytes), 'byteLength': len(index_bytes), 'target': 34963},
    ],
    'accessors': [
        {'bufferView': 0, 'componentType': 5126, 'count': len(positions)//3, 'type': 'VEC3', 'min': [-0.5, -0.5, -0.5], 'max': [0.5, 0.5, 0.5]},
        {'bufferView': 1, 'componentType': 5126, 'count': len(normals)//3, 'type': 'VEC3'},
        {'bufferView': 2, 'componentType': 5123, 'count': len(indices), 'type': 'SCALAR'},
    ],
}

json_bytes = json.dumps(json_obj, separators=(',', ':')).encode('utf-8')
json_bytes += b' ' * ((-len(json_bytes)) % 4)

bin_bytes = pos_bytes + normal_bytes + index_bytes
bin_bytes += b'\x00' * ((-len(bin_bytes)) % 4)

header = struct.pack('<I', 0x46546C67) + struct.pack('<I', 2) + struct.pack('<I', 12 + 8 + len(json_bytes) + 8 + len(bin_bytes))
body = struct.pack('<II', len(json_bytes), 0x4E4F534A) + json_bytes
body += struct.pack('<II', len(bin_bytes), 0x004E4942) + bin_bytes
out.write_bytes(header + body)
print(f'Created {out}')
print(f'Size: {out.stat().st_size} bytes')
